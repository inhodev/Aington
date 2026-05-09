import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    school: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    interest: { type: String, required: true },
    wantsToMeet: { type: String, required: true },
    intro: { type: String, required: true },
    portfolio: { type: String },
  },
  { timestamps: true },
);

export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
