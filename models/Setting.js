import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  companyName: { type: String, default: 'CEELKA BIYAHA SAJID' },
  companyLogo: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  email: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  invoiceSettings: {
    prefix: { type: String, default: 'INV-' },
    footerText: { type: String, default: 'Thank you for your business.' }
  },
  theme: { type: String, enum: ['Light', 'Dark', 'System'], default: 'System' }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
