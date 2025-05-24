const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
}

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
    // createdAt: { type: Date, default: () => getMalaysiaTime() },
    // updatedAt: { type: Date, default: () => getMalaysiaTime() },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }]
    facebookClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FacebookClient' }],
    instagramClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstagramClient' }],
    twitterClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TwitterClient' }],
  }, { timestamps: true }); // Add createdAt and updatedAt automatically

// Pre-save hook to handle Malaysia timezone
userSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = toMalaysiaTime(now);
  if (!this.createdAt) {
      this.createdAt = toMalaysiaTime(now);
  }
  if (this.birthday) {
      this.birthday = toMalaysiaTime(this.birthday);
  }
  if (this.lastLogin) {
      this.lastLogin = toMalaysiaTime(this.lastLogin);
  }
  next();
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
