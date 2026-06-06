import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  customerType: {
    type: String,
    enum: ['With Meter', 'Without Meter'],
    required: true,
  },
  registrationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  initialMeterReading: {
    type: Number,
    default: null,
  },
  fixedMonthlyPrice: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
