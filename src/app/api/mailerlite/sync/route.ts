import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Card from "@/modules/business-card/model";

import mailerlite from "@/lib/mailerlite";

export async function POST(
  req: NextRequest
) {
  try {
    await connectDB();

    const body = await req.json();

    const { ids } = body;

    const cards = await Card.find({
      _id: { $in: ids },
    });

    let synced = 0;

    for (const card of cards) {
      const emails = [
        ...(card.front?.email || []),

        ...(card.back?.email || []),
      ];

      for (const email of emails) {
        if (!email) continue;

        await mailerlite.post(
          "/subscribers",
          {
            email,

            fields: {
              name:
                card.front?.name || "",

              company:
                card.front?.company || "",

              phone:
                card.front?.phone?.[0] ||
                "",
            },

            groups: [],

            status: "active",
          }
        );

        synced++;
      }
    }

    return NextResponse.json({
      success: true,

      synced,
    });
  } catch (error: any) {
    console.error(
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        error:
          "MailerLite sync failed",
      },
      {
        status: 500,
      }
    );
  }
}