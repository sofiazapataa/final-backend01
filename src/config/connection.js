import { connect } from "mongoose";

export const initMongoDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL;

    
    await connect(MONGO_URL);
    console.log("✅ MongoDB connected");
  } catch (error) {
    throw new Error(error);
  }
};

