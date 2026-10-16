const { expect } = require('@playwright/test');

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  // option: 'az' | 'za' | 'lohi' | 'hilo'
  async sortBy(option) {
    await this.sortDropdown.selectOption(option);
  }

  async getAllProductNames() {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  // Adds the product at position `index` (0 = first) and returns { name, price }.
  async addProductByIndex(index) {
    const item = this.items.nth(index);
    const name = (await item.getByTestId('inventory-item-name').textContent()).trim();
    const priceText = await item.getByTestId('inventory-item-price').textContent();
    const price = parseFloat(priceText.replace('$', ''));
    await item.getByRole('button', { name: 'Add to cart' }).click();
    await expect(item.getByRole('button', { name: 'Remove' })).toBeVisible();
    return { name, price };
  }

  async openCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }
}

module.exports = { InventoryPage };
