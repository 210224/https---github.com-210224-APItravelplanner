import mongoose from "mongoose";

const travelSchema = new mongoose.Schema({
    city: { type: String, required: true, unique: true },
    attractions: {
        type: [String],
        required: true,
        default: [],
    },
    transport: {
        type: [String],
        required: true,
        default: [],
    },
    weather: {
        type: String,
        required: true,
    },
    cuisine: {
        type: [String],
        required: true,
        default: [],
    },
});

export const TravelModel = mongoose.model("travelData", travelSchema);
