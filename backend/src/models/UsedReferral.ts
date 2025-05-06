import { Schema, model } from "mongoose";
import {  IUsedReferral } from "../interface/types";

const UsedReferralSchema = new Schema<IUsedReferral>({
  referralCode: String,
  referredUserId: { type: Schema.Types.ObjectId, ref: "User" },
  referrerUserId: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
});

export default model<IUsedReferral>("UsedReferral", UsedReferralSchema);