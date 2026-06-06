import Customer from '../models/Customer.js';

export const generateCustomerId = async () => {
  const customers = await Customer.find({ customerId: /^CUS-\d+$/ }).select('customerId');

  let maxNum = 0;
  for (const customer of customers) {
    const num = parseInt(customer.customerId.replace('CUS-', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }

  return `CUS-${String(maxNum + 1).padStart(4, '0')}`;
};
