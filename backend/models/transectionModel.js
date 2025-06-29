const mongoose = require("mongoose");

const transectionSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
    },
    type: {
        type: String,
        required: [true, "Type is required"],
    },
    category: {
        type: String,
        required: [true, "Cat is required"],
    },
    reference: {
        type: String,
    },
    description: {
        type: String,
        required: [true, "Desc is required"],
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
    },
}, { timestamps: true });

const transectionModel = mongoose.model("transections", transectionSchema);
module.exports = transectionModel;