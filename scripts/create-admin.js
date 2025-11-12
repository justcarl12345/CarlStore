const mongoose = require('mongoose');

// Use your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://carfred834_db_user:Carl122005@ecommerce-cluster.m6gipnv.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Import the User model
    const User = require('../models/User.ts').default;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('Username:', existingAdmin.username);
      console.log('You can login with these credentials');
      return;
    }
    
    // Create default admin user
    const admin = new User({
      username: 'admin',
      password: 'admin123', // This will be hashed automatically
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('You can now login to the admin panel');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();