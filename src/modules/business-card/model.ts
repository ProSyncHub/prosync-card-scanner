import mongoose, { Schema } from "mongoose";

const CardSchema = new Schema(
  {
    front: {
      name: String,
      company: String,
      title: String,
      email: [String],
      phone: [String],
      qrData: [String],
      website: String,
      address: String,
    },

    back: {
      name: String,
      company: String,
      title: String,
      email: [String],
      phone: [String],
      qrData: [String],
      website: String,
      address: String,
    },

    frontImageUrl: String,
    backImageUrl: String,

    category: {
      type: String,
      default: "Uncategorized",
    },

    isTranslated: {
      type: Boolean,
      default: false,
    },

    originalLanguage: String,

    translationNote: String,

    rawOCRText: {
      front: String,
      back: String,
    },

    translatedOCRText: {
      front: String,
      back: String,
    },
  },
  {
    timestamps: true,
  }
);

const Card =
  mongoose.models.cards ||
  mongoose.model("cards", CardSchema);

export default Card;