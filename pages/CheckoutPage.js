const { expect } = require('@playwright/test');

// "Item total: $29.99" -> 29.99
const money = (text) => parseFloat((text || '').replace(/[^0-9.]/g, ''));

class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
  }

  async fillInformation(first, last, zip) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(zip);
    await this.continueButton.click();
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  // Final checkout page: check product names, prices and total.
  async verifyOverview(products) {
    await expect(this.itemNames).toHaveText(products.map((p) => p.name));
    await expect(this.itemPrices).toHaveText(products.map((p) => `$${p.price.toFixed(2)}`));

    const expectedSubtotal = +products.reduce((sum, p) => sum + p.price, 0).toFixed(2);
    const subtotal = money(await this.subtotalLabel.textContent());
    const tax = money(await this.taxLabel.textContent());
    const total = money(await this.totalLabel.textContent());

    expect(subtotal, 'Item total = sum of product prices').toBe(expectedSubtotal);
    expect(tax, 'Tax = 8% of item total').toBeCloseTo(expectedSubtotal * 0.08, 2);
    expect(total, 'Total = item total + tax').toBeCloseTo(subtotal + tax, 2);
    await expect(this.totalLabel).toHaveText(`Total: $${total.toFixed(2)}`);
  }

  async finish() {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async verifyOrderSuccess() {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toContainText('Your order has been dispatched');
  }
}

module.exports = { CheckoutPage };
