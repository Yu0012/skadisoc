import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    detail: { type: String, required: true },
    platform: { type: String, enum: ["facebook", "twitter", "instagram"], required: true }
});

const Client = mongoose.model("Client", clientSchema);
export default Client;