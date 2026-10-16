const { expect } = require('@playwright/test');

class CartPage {
  constructor(page) {
    this.page = page;
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async expectItems(names) {
    await expect(this.itemNames).toHaveText(names);
  }

  async checkout() {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }
}

module.exports = { CartPage };
