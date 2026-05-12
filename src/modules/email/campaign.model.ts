import mongoose from "mongoose";

const recipientSchema =
  new mongoose.Schema(
    {
      name: String,

      email: String,
    },

    {
      _id: false,
    }
  );

const campaignSchema =
  new mongoose.Schema(
    {
      mailerliteId: {
        type: String,
      },

      subject: {
        type: String,
      },

      message: {
        type: String,
      },

      recipients: [
        recipientSchema,
      ],

      status: {
        type: String,

        default: "draft",
      },
    },

    {
      timestamps: true,
    }
  );

export default
  mongoose.models.Campaign ||
  mongoose.model(
    "Campaign",
    campaignSchema
  );