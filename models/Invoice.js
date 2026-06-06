import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  billingMonth: { type: String, required: true },
  previousReading: { type: Number, default: null },
  currentReading: { type: Number, default: null },
  waterConsumption: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
