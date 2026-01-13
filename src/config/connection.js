import { connect } from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

export const initMongoDB = async () => {
  try {
    await connect(MONGO_URL);
    console.log("✅ MongoDB connected");
  } catch (error) {
    throw new Error(error);
  }
};
