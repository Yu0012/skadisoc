// import mongoose from "mongoose";

// const clientSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     detail: { type: String, required: true },
//     platform: { type: String, enum: ["facebook", "twitter", "instagram"], required: true }
// });

// const Client = mongoose.model("Client", clientSchema);
// export default Client;

import mongoose from "mongoose";

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
        accessToken: String,
        connected: { type: Boolean, default: false }
        },
        instagram: {
        businessAccountId: String,
        accessToken: String,
        connected: { type: Boolean, default: false }
        },
        twitter: {
        handle: String,
        accessToken: String,
        accessTokenSecret: String,
        connected: { type: Boolean, default: false }
        },
        linkedin: {
        organizationId: String,
        accessToken: String,
        connected: { type: Boolean, default: false }
        },
        youtube: {
        channelId: String,
        accessToken: String,
        refreshToken: String,
        connected: { type: Boolean, default: false }
        },
        tiktok: {
        accountId: String,
        accessToken: String,
        connected: { type: Boolean, default: false }
        }
    },
    logo: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
    });

const Client = mongoose.model("Client", clientSchema);
export default Client;
