import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amountPaid: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true, enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Other'] },
  notes: { type: String }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
