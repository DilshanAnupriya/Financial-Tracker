const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.Mixed,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["bill", "spending", "goal", "deadline", "reminder"],
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);


module.exports =  mongoose.model("Notification", notificationSchema);


