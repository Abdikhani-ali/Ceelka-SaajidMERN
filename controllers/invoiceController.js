import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';

const getPreviousReading = async (customer) => {
  const lastInvoice = await Invoice.findOne({ customer: customer._id })
    .sort({ createdAt: -1 });

  return lastInvoice ? lastInvoice.currentReading : customer.initialMeterReading;
};

export const getInvoices = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { invoiceNumber: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const invoices = await Invoice.find({ ...keyword })
      .populate('customer', 'fullName customerId customerType')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer');
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, customer, billingMonth, currentReading, unitPrice, dueDate, status } = req.body;

    const invoiceExists = await Invoice.findOne({ invoiceNumber });
    if (invoiceExists) {
      return res.status(400).json({ message: 'Invoice Number already exists' });
    }

    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    let previousReading = null;
    let waterConsumption = 0;
    let totalAmount = 0;
    let resolvedUnitPrice = 0;
    let resolvedCurrentReading = null;

    if (customerDoc.customerType === 'With Meter') {
      if (currentReading === undefined || currentReading === null || currentReading === '') {
        return res.status(400).json({ message: 'Current meter reading is required' });
      }

      if (unitPrice === undefined || unitPrice === null || unitPrice === '') {
        return res.status(400).json({ message: 'Unit price is required for meter-based billing' });
      }

      previousReading = await getPreviousReading(customerDoc);
      resolvedCurrentReading = Number(currentReading);

      if (resolvedCurrentReading < previousReading) {
        return res.status(400).json({ message: 'Current reading cannot be less than previous reading' });
      }

      waterConsumption = resolvedCurrentReading - previousReading;
      resolvedUnitPrice = Number(unitPrice);
      totalAmount = waterConsumption * resolvedUnitPrice;
    } else {
      totalAmount = customerDoc.fixedMonthlyPrice;
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      billingMonth,
      previousReading,
      currentReading: resolvedCurrentReading,
      waterConsumption,
      unitPrice: resolvedUnitPrice,
      totalAmount,
      dueDate,
      status: status || 'Unpaid',
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'fullName customerId customerType');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const customerDoc = await Customer.findById(req.body.customer || invoice.customer);
    if (!customerDoc) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (req.body.invoiceNumber) invoice.invoiceNumber = req.body.invoiceNumber;
    if (req.body.customer) invoice.customer = req.body.customer;
    if (req.body.billingMonth) invoice.billingMonth = req.body.billingMonth;
    if (req.body.dueDate) invoice.dueDate = req.body.dueDate;
    if (req.body.status) invoice.status = req.body.status;

    if (customerDoc.customerType === 'With Meter') {
      const previousReading = req.body.previousReading !== undefined
        ? Number(req.body.previousReading)
        : invoice.previousReading;
      const currentReading = req.body.currentReading !== undefined
        ? Number(req.body.currentReading)
        : invoice.currentReading;
      const unitPrice = req.body.unitPrice !== undefined
        ? Number(req.body.unitPrice)
        : invoice.unitPrice;

      if (currentReading < previousReading) {
        return res.status(400).json({ message: 'Current reading cannot be less than previous reading' });
      }

      invoice.previousReading = previousReading;
      invoice.currentReading = currentReading;
      invoice.waterConsumption = currentReading - previousReading;
      invoice.unitPrice = unitPrice;
      invoice.totalAmount = invoice.waterConsumption * unitPrice;
    } else {
      invoice.previousReading = null;
      invoice.currentReading = null;
      invoice.waterConsumption = 0;
      invoice.unitPrice = 0;
      invoice.totalAmount = customerDoc.fixedMonthlyPrice;
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
      await invoice.deleteOne();
      res.json({ message: 'Invoice removed' });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
