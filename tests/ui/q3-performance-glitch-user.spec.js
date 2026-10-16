const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { MenuComponent } = require('../../pages/MenuComponent');
const { InventoryPage } = require('../../pages/InventoryPage');
const { CartPage } = require('../../pages/CartPage');
const { CheckoutPage } = require('../../pages/CheckoutPage');
const { USERS, PASSWORD, CUSTOMER } = require('../test-data');

test.describe('Q3 | Performance glitch user with Z-A filter', () => {
  test.setTimeout(150000); // this user is slow on purpose

  test('performance_glitch_user sorts Z to A, buys first product, completes order', async ({ page }) => {
    const login = new LoginPage(page);
    const menu = new MenuComponent(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    let product;

    await test.step('Login with performance_glitch_user', async () => {
      await login.goto();
      await login.login(USERS.performanceGlitch, PASSWORD);
      await inventory.expectLoaded();
    });

    await test.step('Reset App State', async () => {
      await menu.resetAppState();
    });

    await test.step('Filter by Name (Z to A) and verify order', async () => {
      await inventory.sortBy('za');
      const names = await inventory.getAllProductNames();
      const expected = [...names].sort((a, b) => b.localeCompare(a));
      expect(names).toEqual(expected);
    });

    await test.step('Add the first product to the cart', async () => {
      product = await inventory.addProductByIndex(0);
      await expect(menu.cartBadge).toHaveText('1');
    });

    await test.step('Go to cart and checkout', async () => {
      await inventory.openCart();
      await cart.expectItems([product.name]);
      await cart.checkout();
      await checkout.fillInformation(CUSTOMER.firstName, CUSTOMER.lastName, CUSTOMER.postalCode);
    });

    await test.step('Verify all product names and total price', async () => {
      await checkout.verifyOverview([product]);
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
