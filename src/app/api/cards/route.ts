import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Card from "@/modules/business-card/model";

export async function GET() {
  try {
    await connectDB();

    const cards =
      await Card.find({})
        .sort({
          createdAt: -1,
        });

    return NextResponse.json(
      cards
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch cards",
      },
      {
        status: 500,
      }
    );
  }
}