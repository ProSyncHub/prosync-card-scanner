import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Campaign from "@/modules/email/campaign.model";

import mailerlite from "@/lib/mailerlite";

type ParamsType = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: NextRequest,
  { params }: ParamsType
) {
  try {
    await connectDB();

    const { id } = await params;

    /* =========================
       LOCAL CAMPAIGN
    ========================= */

    const campaign =
      await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        {
          error:
            "Campaign not found",
        },
        {
          status: 404,
        }
      );
    }

    let analytics: any = null;

    /* =========================
       MAILERLITE ANALYTICS
    ========================= */

    if (
      campaign.mailerliteId
    ) {
      try {
        const response =
          await mailerlite.get(
            `/campaigns/${campaign.mailerliteId}`
          );

        analytics =
          response.data?.data ||
          null;
      } catch (error) {
        console.error(
          "MailerLite analytics fetch failed"
        );
      }
    }

    return NextResponse.json({
      success: true,

      campaign,

      analytics,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch campaign details",
      },
      {
        status: 500,
      }
    );
  }
}