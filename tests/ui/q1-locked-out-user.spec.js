const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { USERS, PASSWORD, MESSAGES } = require('../test-data');

test.describe('Q1 | Locked out user', () => {
  test('login with locked_out_user shows the locked-out error message', async ({ page }) => {
    const login = new LoginPage(page);

    await test.step('Open login page', async () => {
      await login.goto();
    });

    await test.step('Login with locked_out_user', async () => {
      await login.login(USERS.lockedOut, PASSWORD);
    });

    await test.step('Verify error message', async () => {
      await expect(login.errorMessage).toBeVisible();
      await expect(login.errorMessage).toHaveText(MESSAGES.lockedOut);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });
});
