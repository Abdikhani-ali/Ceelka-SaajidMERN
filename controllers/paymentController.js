import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';

export const getPayments = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { paymentId: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const payments = await Payment.find({ ...keyword })
      .populate('customer', 'fullName customerId')
      .populate('invoice', 'invoiceNumber totalAmount status')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customer')
      .populate('invoice');
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { paymentId, customer, invoice, amountPaid, paymentDate, paymentMethod, notes } = req.body;

    const paymentExists = await Payment.findOne({ paymentId });
    if (paymentExists) {
      return res.status(400).json({ message: 'Payment ID already exists' });
    }

    const payment = await Payment.create({
      paymentId,
      customer,
      invoice,
      amountPaid,
      paymentDate: paymentDate || Date.now(),
      paymentMethod,
      notes,
    });

    // Update invoice status if paid in full (simplified logic)
    const inv = await Invoice.findById(invoice);
    if (inv && inv.totalAmount <= amountPaid) {
      inv.status = 'Paid';
      await inv.save();
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (payment) {
      payment.paymentId = req.body.paymentId || payment.paymentId;
      payment.customer = req.body.customer || payment.customer;
      payment.invoice = req.body.invoice || payment.invoice;
      payment.amountPaid = req.body.amountPaid || payment.amountPaid;
      payment.paymentDate = req.body.paymentDate || payment.paymentDate;
      payment.paymentMethod = req.body.paymentMethod || payment.paymentMethod;
      payment.notes = req.body.notes || payment.notes;

      const updatedPayment = await payment.save();
      res.json(updatedPayment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (payment) {
      // Revert invoice status if needed (optional logic skipped for brevity)
      await payment.deleteOne();
      res.json({ message: 'Payment removed' });
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
