import { connectDB } from "@/lib/mongodb";
import Card from "../model";

export async function getCards() {
  await connectDB();

  const cards = await Card.find({})
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(cards));
}