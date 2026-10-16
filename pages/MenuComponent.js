const { expect } = require('@playwright/test');

// The hamburger (side) menu, available on every page after login.
class MenuComponent {
  constructor(page) {
    this.page = page;
    this.openButton = page.locator('#react-burger-menu-btn');
    this.closeButton = page.locator('#react-burger-cross-btn');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async open() {
    await this.openButton.click();
    await expect(this.resetAppStateLink).toBeVisible();
  }

  async close() {
    await this.closeButton.click();
    await expect(this.resetAppStateLink).toBeHidden();
  }

  // Reset App State, then check the cart is empty.
  async resetAppState() {
    await this.open();
    await this.resetAppStateLink.click();
    await this.close();
    // After reset, buttons on the page still show "Remove" until reload.
    await this.page.reload();
    await expect(this.cartBadge).toHaveCount(0);
  }

  async logout() {
    await this.open();
    await this.logoutLink.click();
    await expect(this.page.getByTestId('login-button')).toBeVisible();
  }
}

module.exports = { MenuComponent };
