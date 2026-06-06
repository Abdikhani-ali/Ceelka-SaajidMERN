import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    const totalPayments = await Payment.countDocuments();
    
    const revenueAggr = await Payment.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } }
    ]);
    const totalRevenue = revenueAggr.length > 0 ? revenueAggr[0].totalRevenue : 0;

    const recentActivities = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'fullName');

    res.json({
      totalCustomers,
      totalInvoices,
      totalPayments,
      totalRevenue,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCollectionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const payments = await Payment.find(query)
      .populate('customer', 'fullName customerId')
      .populate('invoice', 'invoiceNumber')
      .sort({ paymentDate: -1 });

    const totalCollected = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);

    res.json({
      totalCollected,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
