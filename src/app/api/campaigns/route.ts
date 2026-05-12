import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Campaign from "@/modules/email/campaign.model";

export async function GET() {
  try {
    await connectDB();

    const campaigns =
      await Campaign.find()
        .sort({
          createdAt: -1,
        });

    return NextResponse.json({
      success: true,

      data: campaigns,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch campaigns",
      },
      {
        status: 500,
      }
    );
  }
}