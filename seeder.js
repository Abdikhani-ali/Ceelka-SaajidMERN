import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();

    const adminUser = {
      fullName: 'System Admin',
      username: 'admin',
      email: 'admin@ceelkabiyaha.com',
      password: 'password123',
      role: 'Admin',
      status: 'Active'
    };

    await User.create(adminUser);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
