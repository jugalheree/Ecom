import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorMarketplaceListing",
      required: true,
    },
    sellerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    sellerUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    buyerVendorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    buyerUserId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    proposedPrice:  { type: Number, required: true },
    proposedQty:    { type: Number, required: true },
    totalAmount:    { type: Number, required: true },
    terms:          { type: String, default: "" },
    deliveryDays:   { type: Number, default: 7 },
    counterPrice:   Number,
    counterQty:     Number,
    counterTerms:   String,
    status: {
      type: String,
      enum: ["PROPOSED","COUNTERED","ACCEPTED","REJECTED","ACTIVE","COMPLETED","BROKEN","CANCELLED"],
      default: "PROPOSED",
    },
    sellerSigned:     { type: Boolean, default: false },
    buyerSigned:      { type: Boolean, default: false },
    signedAt:         Date,
    brokenBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    brokenReason:     String,
    ratingDeducted:   { type: Boolean, default: false },
    messages: [
      {
        senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderName: String,
        message:    String,
        timestamp:  { type: Date, default: Date.now },
        read:       { type: Boolean, default: false },
      },
    ],
    completedAt: Date,

    // Order created when both sign
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    // Custom delivery address chosen by buyer during deal proposal
    deliveryAddress: {
      name:    String,
      phone:   String,
      street:  String,
      area:    String,
      city:    String,
      state:   String,
      pincode: String,
      lat:     Number,
      lng:     Number,
    },
  },
  { timestamps: true }
);

dealSchema.index({ sellerVendorId: 1, status: 1 });
dealSchema.index({ buyerVendorId: 1, status: 1 });

export const Deal = mongoose.model("Deal", dealSchema);