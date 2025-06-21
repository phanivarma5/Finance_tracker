const mongoose = require("mongoose");
const transectionModel = require("../models/transectionModel");
const moment = require("moment");

const getAllTransection = async (req, res) => {
    console.log("GET /api/v1/transections/get-transection endpoint hit");
    try {
        const { frequency, userid, selectedDate, type } = req.query; // Get selectedDate and type from query
        console.log("Frequency:", frequency);
        console.log("User  ID:", userid);
        console.log("Selected Date:", selectedDate);
        console.log("Type:", type); // Log type for debugging

        if (!userid) {
            return res.status(400).json({ success: false, message: "User  ID is required" });
        }

        const query = {
            userid: userid,
        };

        // Handle frequency-based filtering
        if (frequency !== "custom") {
            query.date = {
                $gt: moment().subtract(Number(frequency), "days").toDate(),
            };
        } else if (selectedDate && selectedDate.length === 2) {
            const startDate = new Date(selectedDate[0]);
            const endDate = new Date(selectedDate[1]);
            query.date = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        // Handle type-based filtering
        if (type && type !== "all") {
            query.type = type; // Add type filter to the query
        }

        const transections = await transectionModel.find(query);

        res.status(200).json({ success: true, data: transections });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const editTransection = async (req, res) => {
    try {
        await transectionModel.findOneAndUpdate({_id:req.body.transactionId}, req.body.payload);
        res.status(200).send("Edit Successful");
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const deleteTransection = async (req, res) => {
    try {
        await transectionModel.findOneAndDelete({_id:req.body.transactionId});
        res.status(200).send("Transection Deleted!");
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const addTransection = async (req, res) => {
    try {
        const newTransection = new transectionModel(req.body);
        await newTransection.save();
        res.status(201).json({ success: true, message: "Transaction Created" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAllTransection, addTransection, editTransection, deleteTransection };