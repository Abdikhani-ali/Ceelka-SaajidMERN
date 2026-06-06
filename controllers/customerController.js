import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import { generateCustomerId } from '../utils/generateCustomerId.js';

// @desc    Get all customers with search, filter, and pagination
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const keyword = req.query.keyword || '';
    const customerType = req.query.customerType || '';

    const query = {};

    if (keyword) {
      query.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { customerId: { $regex: keyword, $options: 'i' } },
        { phoneNumber: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (customerType && customerType !== 'All') {
      query.customerType = customerType;
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      customers,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get next customer ID preview
// @route   GET /api/customers/next-id
// @access  Private
export const getNextCustomerId = async (req, res) => {
  try {
    const customerId = await generateCustomerId();
    res.json({ customerId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get billing info for invoice creation
// @route   GET /api/customers/:id/billing-info
// @access  Private
export const getCustomerBillingInfo = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    let previousReading = null;

    if (customer.customerType === 'With Meter') {
      const lastInvoice = await Invoice.findOne({ customer: customer._id })
        .sort({ createdAt: -1 });

      previousReading = lastInvoice
        ? lastInvoice.currentReading
        : customer.initialMeterReading;
    }

    res.json({
      customerType: customer.customerType,
      previousReading,
      fixedMonthlyPrice: customer.fixedMonthlyPrice,
      initialMeterReading: customer.initialMeterReading,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      address,
      customerType,
      status,
      initialMeterReading,
      fixedMonthlyPrice,
      registrationDate,
    } = req.body;

    if (!customerType || !['With Meter', 'Without Meter'].includes(customerType)) {
      return res.status(400).json({ message: 'Valid customer type is required' });
    }

    if (customerType === 'With Meter' && (initialMeterReading === undefined || initialMeterReading === null || initialMeterReading === '')) {
      return res.status(400).json({ message: 'Initial meter reading is required for customers with a meter' });
    }

    if (customerType === 'Without Meter' && (fixedMonthlyPrice === undefined || fixedMonthlyPrice === null || fixedMonthlyPrice === '')) {
      return res.status(400).json({ message: 'Fixed monthly price is required for customers without a meter' });
    }

    const customerId = await generateCustomerId();
    const now = new Date();

    const customerData = {
      customerId,
      fullName,
      phoneNumber,
      address,
      customerType,
      status: status || 'Active',
      initialMeterReading: customerType === 'With Meter' ? Number(initialMeterReading) : null,
      fixedMonthlyPrice: customerType === 'Without Meter' ? Number(fixedMonthlyPrice) : null,
      registrationDate: registrationDate ? new Date(registrationDate) : now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await Customer.collection.insertOne(customerData);
    const customer = await Customer.findById(result.insertedId);

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const {
      fullName,
      phoneNumber,
      address,
      customerType,
      status,
      initialMeterReading,
      fixedMonthlyPrice,
      registrationDate,
    } = req.body;

    if (fullName !== undefined) customer.fullName = fullName;
    if (phoneNumber !== undefined) customer.phoneNumber = phoneNumber;
    if (address !== undefined) customer.address = address;
    if (status !== undefined) customer.status = status;
    if (registrationDate !== undefined) customer.registrationDate = registrationDate;

    if (customerType !== undefined) {
      customer.customerType = customerType;
    }

    const type = customer.customerType;

    const updateData = {
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      status: customer.status,
      registrationDate: customer.registrationDate,
      customerType: type,
      updatedAt: new Date(),
    };

    if (type === 'With Meter') {
      if (initialMeterReading !== undefined) {
        updateData.initialMeterReading = Number(initialMeterReading);
      } else {
        updateData.initialMeterReading = customer.initialMeterReading;
      }
      updateData.fixedMonthlyPrice = null;
    } else if (type === 'Without Meter') {
      if (fixedMonthlyPrice !== undefined) {
        updateData.fixedMonthlyPrice = Number(fixedMonthlyPrice);
      } else {
        updateData.fixedMonthlyPrice = customer.fixedMonthlyPrice;
      }
      updateData.initialMeterReading = null;
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin or Manager
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      await customer.deleteOne();
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
