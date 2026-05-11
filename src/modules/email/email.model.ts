import mongoose from "mongoose";

const EmailHistorySchema =
  new mongoose.Schema(
    {
      subject: String,

      message: String,

      recipients: [String],

      recipientCount: Number,

      status: {
        type: String,
        default: "sent",
      },

      provider: {
        type: String,
        default: "resend",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },

    {
      timestamps: true,
    }
  );

export default
  mongoose.models.EmailHistory ||
  mongoose.model(
    "EmailHistory",
    EmailHistorySchema
  );