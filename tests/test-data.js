const PASSWORD = 'secret_sauce';

const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  performanceGlitch: 'performance_glitch_user',
};

const CUSTOMER = { firstName: 'Test', lastName: 'User', postalCode: '1207' };

const MESSAGES = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  orderSuccess: 'Thank you for your order!',
};

module.exports = { PASSWORD, USERS, CUSTOMER, MESSAGES };
