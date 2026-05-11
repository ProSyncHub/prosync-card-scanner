import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import EmailHistory from "@/modules/email/email.model";

export async function GET() {
  try {
    await connectDB();

    const history =
      await EmailHistory.find({})
        .sort({
          createdAt: -1,
        })
        .limit(20);

    const totalSent =
      history.reduce(
        (acc, item) =>
          acc +
          (item.recipientCount ||
            0),
        0
      );

    const DAILY_LIMIT = 100;

    const MONTHLY_LIMIT = 3000;

    return NextResponse.json({
      history,

      totalSent,

      remainingDaily:
        DAILY_LIMIT - totalSent,

      remainingMonthly:
        MONTHLY_LIMIT - totalSent,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch history",
      },
      {
        status: 500,
      }
    );
  }
}