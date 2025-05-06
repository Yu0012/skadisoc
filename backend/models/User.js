const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
    roleType: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' },
    permissions: {
      menus: [String],
      actions: [String],
    },
    fullName: { type: String },
    birthday: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }]
  });
  

// Hash password before save
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare plain password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) {
    throw new Error("Password or candidate password missing.");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};
  
module.exports = mongoose.model('User', userSchema);
