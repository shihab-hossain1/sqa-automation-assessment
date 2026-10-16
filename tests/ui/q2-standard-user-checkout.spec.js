const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { MenuComponent } = require('../../pages/MenuComponent');
const { InventoryPage } = require('../../pages/InventoryPage');
const { CartPage } = require('../../pages/CartPage');
const { CheckoutPage } = require('../../pages/CheckoutPage');
const { USERS, PASSWORD, CUSTOMER } = require('../test-data');

test.describe('Q2 | Standard user purchase journey', () => {
  test('standard_user buys three items and completes the order', async ({ page }) => {
    const login = new LoginPage(page);
    const menu = new MenuComponent(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const added = [];

    await test.step('Login with standard_user', async () => {
      await login.goto();
      await login.login(USERS.standard, PASSWORD);
      await inventory.expectLoaded();
    });

    await test.step('Reset App State', async () => {
      await menu.resetAppState();
    });

    await test.step('Add three items to the cart', async () => {
      for (const i of [0, 1, 2]) {
        added.push(await inventory.addProductByIndex(i));
      }
      await expect(menu.cartBadge).toHaveText('3');
    });

    await test.step('Go to cart and checkout', async () => {
      await inventory.openCart();
      await cart.expectItems(added.map((p) => p.name));
      await cart.checkout();
      await checkout.fillInformation(CUSTOMER.firstName, CUSTOMER.lastName, CUSTOMER.postalCode);
    });

    await test.step('Verify product names and total price', async () => {
      await checkout.verifyOverview(added);
    });

    await test.step('Finish and verify success message', async () => {
      await checkout.finish();
      await checkout.verifyOrderSuccess();
    });

    await test.step('Reset App State again and logout', async () => {
      await menu.resetAppState();
      await menu.logout();
    });
  });
});
