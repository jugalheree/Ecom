import { Deal } from "../models/marketplace/Deal.model.js";
import { VendorMarketplaceListing } from "../models/vendor/VendorMarketplaceListing.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { Rating } from "../models/product/Rating.model.js";
import { Address } from "../models/user/Address.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Helper: get vendor for current user
const getVendor = async (userId) => {
  const vendor = await Vendor.findOne({ userId, isActive: true }).lean();
  if (!vendor) throw new ApiError(403, "Active vendor profile required");
  return vendor;
};

// ── POST /api/deals — Propose a deal ─────────────────────────────────────
export const proposeDeal = asyncHandler(async (req, res) => {
  const { listingId, proposedPrice, proposedQty, terms, deliveryDays } = req.body;

  if (!listingId || !proposedPrice || !proposedQty) {
    throw new ApiError(400, "listingId, proposedPrice and proposedQty are required");
  }

  const listing = await VendorMarketplaceListing.findById(listingId).populate("vendorId").lean();
  if (!listing || !listing.isActive) throw new ApiError(404, "Listing not found or inactive");

  const buyerVendor = await getVendor(req.user._id);

  if (listing.vendorId._id.toString() === buyerVendor._id.toString()) {
    throw new ApiError(400, "Cannot make a deal with your own listing");
  }

  if (proposedQty > listing.stock) {
    throw new ApiError(400, `Only ${listing.stock} units available`);
  }

  const deal = await Deal.create({
    listingId,
    sellerVendorId: listing.vendorId._id,
    sellerUserId:   listing.vendorId.userId,
    buyerVendorId:  buyerVendor._id,
    buyerUserId:    req.user._id,
    proposedPrice:  Number(proposedPrice),
    proposedQty:    Number(proposedQty),
    totalAmount:    Number(proposedPrice) * Number(proposedQty),
    terms:          terms || "",
    deliveryDays:   deliveryDays || 7,
    messages: [{
      senderId:   req.user._id,
      senderName: req.user.name,
      message:    `Deal proposed: ${proposedQty} units at ₹${proposedPrice}/unit. Total: ₹${Number(proposedPrice) * Number(proposedQty)}`,
      timestamp:  new Date(),
    }],
  });

  return res.status(201).json(new ApiResponse(201, deal, "Deal proposed successfully"));
});

// ── GET /api/deals/my — My deals (as seller or buyer) ────────────────────
export const getMyDeals = asyncHandler(async (req, res) => {
  const vendor = await getVendor(req.user._id);
  const { status } = req.query;

  const filter = {
    $or: [{ sellerVendorId: vendor._id }, { buyerVendorId: vendor._id }],
  };
  if (status) filter.status = status;

  const deals = await Deal.find(filter)
    .sort({ updatedAt: -1 })
    .populate({ path: "listingId", select: "title originalPrice discountedPrice unit" })
    .populate({ path: "sellerVendorId", select: "shopName" })
    .populate({ path: "buyerVendorId",  select: "shopName" })
    .lean();

  return res.status(200).json(new ApiResponse(200, deals, "Deals fetched"));
});

// ── GET /api/deals/:dealId — Get deal detail with messages ───────────────
export const getDealById = asyncHandler(async (req, res) => {
  const { dealId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(dealId)) throw new ApiError(400, "Invalid deal ID");

  const vendor = await getVendor(req.user._id);

  const deal = await Deal.findOne({
    _id: dealId,
    $or: [{ sellerVendorId: vendor._id }, { buyerVendorId: vendor._id }],
  })
    .populate({ path: "listingId", select: "title originalPrice discountedPrice unit stock" })
    .populate({ path: "sellerVendorId", select: "shopName vendorScore" })
    .populate({ path: "buyerVendorId",  select: "shopName vendorScore" })
    .lean();

  if (!deal) throw new ApiError(404, "Deal not found or access denied");

  // Mark messages as read
  await Deal.updateOne(
    { _id: dealId },
    { $set: { "messages.$[m].read": true } },
    { arrayFilters: [{ "m.senderId": { $ne: req.user._id } }] }
  );

  return res.status(200).json(new ApiResponse(200, deal, "Deal fetched"));
});

// ── PATCH /api/deals/:dealId/respond — Seller accepts/counters/rejects ───
export const respondToDeal = asyncHandler(async (req, res) => {
  const { dealId } = req.params;
  const { action, counterPrice, counterQty, counterTerms, message } = req.body;

  if (!["ACCEPT","COUNTER","REJECT"].includes(action)) {
    throw new ApiError(400, "action must be ACCEPT, COUNTER, or REJECT");
  }

  const vendor = await getVendor(req.user._id);
  const deal = await Deal.findOne({ _id: dealId, sellerVendorId: vendor._id });
  if (!deal) throw new ApiError(404, "Deal not found or you are not the seller");

  if (!["PROPOSED","COUNTERED"].includes(deal.status)) {
    throw new ApiError(400, `Cannot respond to a deal in ${deal.status} status`);
  }

  if (action === "ACCEPT") {
    deal.status = "ACCEPTED";
    deal.messages.push({ senderId: req.user._id, senderName: req.user.name, message: message || "✅ Deal accepted! Please sign to make it binding." });
  } else if (action === "COUNTER") {
    if (!counterPrice || !counterQty) throw new ApiError(400, "Counter price and qty required");
    deal.status       = "COUNTERED";
    deal.counterPrice = Number(counterPrice);
    deal.counterQty   = Number(counterQty);
    deal.counterTerms = counterTerms || "";
    deal.messages.push({ senderId: req.user._id, senderName: req.user.name, message: message || `Counter offer: ${counterQty} units at ₹${counterPrice}/unit` });
  } else {
    deal.status = "REJECTED";
    deal.messages.push({ senderId: req.user._id, senderName: req.user.name, message: message || "❌ Deal rejected." });
  }

  await deal.save();
  return res.status(200).json(new ApiResponse(200, deal, `Deal ${action.toLowerCase()}ed`));
});

// ── PATCH /api/deals/:dealId/sign — Sign the deal ────────────────────────
export const signDeal = asyncHandler(async (req, res) => {
  const { dealId } = req.params;
  const vendor = await getVendor(req.user._id);

  const deal = await Deal.findOne({
    _id: dealId,
    $or: [{ sellerVendorId: vendor._id }, { buyerVendorId: vendor._id }],
  });

  if (!deal) throw new ApiError(404, "Deal not found");
  if (deal.status !== "ACCEPTED") {
    throw new ApiError(400, "Deal must be accepted before signing");
  }

  const isSeller = deal.sellerVendorId.toString() === vendor._id.toString();
  if (isSeller) {
    if (deal.sellerSigned) throw new ApiError(400, "You have already signed this deal");
    deal.sellerSigned = true;
  } else {
    if (deal.buyerSigned) throw new ApiError(400, "You have already signed this deal");
    deal.buyerSigned = true;
  }

  deal.messages.push({
    senderId:   req.user._id,
    senderName: req.user.name,
    message:    `✍️ ${req.user.name} has signed the deal.`,
  });

  // Both signed → ACTIVE: deduct listing stock + show buyer address to seller
  if (deal.sellerSigned && deal.buyerSigned) {
    const finalQty = deal.counterQty || deal.proposedQty;

    // Deduct stock from the listing atomically
    const listing = await VendorMarketplaceListing.findOneAndUpdate(
      { _id: deal.listingId, stock: { $gte: finalQty }, isActive: true },
      { $inc: { stock: -finalQty } },
      { new: true }
    );

    if (!listing) {
      throw new ApiError(400, `Insufficient stock to finalise deal. Only ${
        (await VendorMarketplaceListing.findById(deal.listingId).select("stock").lean())?.stock ?? 0
      } units available.`);
    }

    // Deactivate listing if stock hits 0
    if (listing.stock === 0) {
      listing.isActive = false;
      await listing.save();
    }

    // Fetch buyer vendor's delivery address to show seller
    const buyerVendorFull = await Vendor.findById(deal.buyerVendorId)
      .select("shopName businessAddresses")
      .lean();

    let buyerAddressStr = "No address on file";
    if (buyerVendorFull?.businessAddresses?.length) {
      const addr = await Address.findById(buyerVendorFull.businessAddresses[0])
        .select("buildingNameOrNumber area city state pincode")
        .lean();
      if (addr) {
        buyerAddressStr = [
          addr.buildingNameOrNumber,
          addr.area,
          addr.city,
          addr.state,
          addr.pincode,
        ].filter(Boolean).join(", ");
      }
    }

    deal.status   = "ACTIVE";
    deal.signedAt = new Date();
    deal.messages.push({
      senderId:   req.user._id,
      senderName: "System",
      message:    `🎉 Deal is now ACTIVE! Both parties have signed.\n📍 Delivery to (Buyer): ${buyerVendorFull?.shopName} — ${buyerAddressStr}\n📦 Stock reduced by ${finalQty} units.`,
    });
  }

  await deal.save();
  return res.status(200).json(new ApiResponse(200, deal, "Deal signed"));
});

// ── PATCH /api/deals/:dealId/complete — Mark deal as completed ───────────
export const completeDeal = asyncHandler(async (req, res) => {
  const { dealId } = req.params;
  const vendor = await getVendor(req.user._id);

  const deal = await Deal.findOne({ _id: dealId, sellerVendorId: vendor._id, status: "ACTIVE" });
  if (!deal) throw new ApiError(404, "Active deal not found for your store");

  deal.status      = "COMPLETED";
  deal.completedAt = new Date();
  deal.messages.push({ senderId: req.user._id, senderName: req.user.name, message: "✅ Deal marked as completed." });
  await deal.save();

  return res.status(200).json(new ApiResponse(200, deal, "Deal completed"));
});

// ── PATCH /api/deals/:dealId/break — Break the deal (penalty applied) ────
export const breakDeal = asyncHandler(async (req, res) => {
  const { dealId } = req.params;
  const { reason } = req.body;
  if (!reason) throw new ApiError(400, "Reason required when breaking a deal");

  const vendor = await getVendor(req.user._id);

  const deal = await Deal.findOne({
    _id: dealId,
    $or: [{ sellerVendorId: vendor._id }, { buyerVendorId: vendor._id }],
    status: "ACTIVE",
  });

  if (!deal) throw new ApiError(404, "Active deal not found");

  deal.status      = "BROKEN";
  deal.brokenBy    = req.user._id;
  deal.brokenReason = reason;

  // Penalise: deduct 10 points from vendor score
  if (!deal.ratingDeducted) {
    await Vendor.findByIdAndUpdate(vendor._id, {
      $inc: { vendorScore: -10 },
    });
    deal.ratingDeducted = true;
  }

  deal.messages.push({
    senderId:   req.user._id,
    senderName: req.user.name,
    message:    `⚠️ Deal broken by ${req.user.name}. Reason: ${reason}. -10 vendor score penalty applied.`,
  });

  await deal.save();
  return res.status(200).json(new ApiResponse(200, deal, "Deal broken — rating penalty applied"));
});

// ── POST /api/deals/:dealId/message — Send a chat message ────────────────
export const sendDealMessage = asyncHandler(async (req, res) => {
  const { dealId } = req.params;
  const { message } = req.body;
  if (!message?.trim()) throw new ApiError(400, "Message cannot be empty");

  const vendor = await getVendor(req.user._id);

  const deal = await Deal.findOne({
    _id: dealId,
    $or: [{ sellerVendorId: vendor._id }, { buyerVendorId: vendor._id }],
  });

  if (!deal) throw new ApiError(404, "Deal not found or access denied");
  if (["COMPLETED","BROKEN","REJECTED","CANCELLED"].includes(deal.status)) {
    throw new ApiError(400, "Cannot message on a closed deal");
  }

  deal.messages.push({
    senderId:   req.user._id,
    senderName: req.user.name,
    message:    message.trim(),
    timestamp:  new Date(),
  });

  await deal.save();

  const lastMsg = deal.messages[deal.messages.length - 1];
  return res.status(201).json(new ApiResponse(201, lastMsg, "Message sent"));
});
