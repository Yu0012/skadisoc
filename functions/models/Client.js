
const mongoose = require('mongoose');

// Create a function to format time to Malaysia timezone
function toMalaysiaTime(date) {
    return new Date(date.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
  }  

const clientSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    description: { type: String },
    assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    socialMediaAccounts: {
        facebook: {
        pageId: String,
        companyToken: String,
        connected: { type: Boolean, default: false }
        },
        instagram: {
        pageId: String,
        companyToken: String,
        connected: { type: Boolean, default: false }
        },
        twitter: {
        apiKey: String,
        apiKeySecret: String,
        accessToken: String,
        accessTokenSecret: String,
        connected: { type: Boolean, default: false }
        },
        linkedin: {
        organizationId: String,
        accessToken: String,
        connected: { type: Boolean, default: false }
        }
    },
    logo: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    }, { timestamps: true });

// Pre-save hook to handle Malaysia timezone
clientSchema.pre('save', function(next) {
    const now = new Date();
    this.updatedAt = toMalaysiaTime(now);
    if (!this.createdAt) {
        this.createdAt = toMalaysiaTime(now);
    }
    next();
  });

module.exports = mongoose.model('Client', clientSchema);