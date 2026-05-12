import { NextResponse } from "next/server";

import mailerlite from "@/lib/mailerlite";

export async function GET() {
  try {
    const subscribers =
      await mailerlite.get(
        "/subscribers"
      );

    const campaigns =
      await mailerlite.get(
        "/campaigns"
      );

    return NextResponse.json({
      subscriberCount:
        subscribers.data
          ?.meta?.total || 0,

      campaignCount:
        campaigns.data
          ?.meta?.total || 0,
    });
  } catch (error: any) {
    console.error(
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch MailerLite stats",
      },
      {
        status: 500,
      }
    );
  }
}