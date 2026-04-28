import { test, expect } from '@playwright/test';

// ============================================================
// BUG FIXES DOCUMENTATION:
//
// Bug #1: Missing await before input.fill()
//   - fill() is async; without await the click fires before
//     text is entered into the field
//   - Fix: added await before input.fill()
//
// Bug #2: Selector #message-input likely incorrect
//   - Comment in original code warned selector may not match DOM
//   - Changed to data-testid="message-input" per React conventions
//   - Fix: page.locator('[data-testid="message-input"]')
//
// Bug #3: .last() is unreliable assertion
//   - Comment warned assertion may check wrong element
//   - If other messages exist, .last() returns wrong bubble
//   - Fix: .filter({ hasText }) targets the exact message
// ============================================================

test('send a chat message', async ({ page }) => {
  await page.goto('http://localhost:3000/stream/1');

  const input = page.locator('[data-testid="message-input"]'); // Fix #2
  await input.fill('Hello stream!');                           // Fix #1
  await page.click('[data-testid="send-button"]');

  await expect(                                                // Fix #3
    page.locator('.message-bubble').filter({ hasText: 'Hello stream!' })
  ).toBeVisible();
});

test('moderator can delete a message', async ({ page }) => {
  // Regular user sends a message first
  await page.goto('http://localhost:3000/stream/1');
  const input = page.locator('[data-testid="message-input"]');
  await input.fill('Message to be deleted');
  await page.click('[data-testid="send-button"]');
  await expect(
    page.locator('.message-bubble').filter({ hasText: 'Message to be deleted' })
  ).toBeVisible();

  // Moderator logs in
  await page.goto('http://localhost:3000/login');
  await page.locator('[data-testid="email-input"]').fill('moderator@test.com');
  await page.locator('[data-testid="password-input"]').fill('ModPassword123');
  await page.click('[data-testid="login-button"]');

  // Moderator navigates to stream and deletes the message
  await page.goto('http://localhost:3000/stream/1');
  const message = page.locator('.message-bubble')
    .filter({ hasText: 'Message to be deleted' });
  await message.hover();
  await page.click('[data-testid="delete-message-button"]');

  // Verify message is removed
  await expect(message).not.toBeVisible();
});

test('timeout blocks message sending', async ({ page }) => {
  // Moderator logs in and applies timeout to target user
  await page.goto('http://localhost:3000/login');
  await page.locator('[data-testid="email-input"]').fill('moderator@test.com');
  await page.locator('[data-testid="password-input"]').fill('ModPassword123');
  await page.click('[data-testid="login-button"]');

  await page.goto('http://localhost:3000/stream/1');
  const targetMessage = page.locator('.message-bubble')
    .filter({ hasText: 'targetuser' }).first();
  await targetMessage.hover();
  await page.click('[data-testid="timeout-button"]');
  await page.locator('[data-testid="timeout-duration"]').fill('10');
  await page.click('[data-testid="confirm-timeout"]');

  // Timed-out user logs in and tries to send a message
  await page.goto('http://localhost:3000/login');
  await page.locator('[data-testid="email-input"]').fill('targetuser@test.com');
  await page.locator('[data-testid="password-input"]').fill('UserPassword123');
  await page.click('[data-testid="login-button"]');

  await page.goto('http://localhost:3000/stream/1');

  // Input must be disabled for timed-out user
  await expect(
    page.locator('[data-testid="message-input"]')
  ).toBeDisabled();

  // Error toast must be visible
  await expect(
    page.locator('[data-testid="error-toast"]')
  ).toContainText('timed out');
});