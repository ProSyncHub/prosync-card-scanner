import {
  NextRequest,
  NextResponse,
} from "next/server";

import mailerlite from "@/lib/mailerlite";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const { email, name } =
      body;

    const groupId =
      process.env
        .MAILERLITE_GROUP_ID;

    /* ======================
       CREATE / UPDATE SUBSCRIBER
    ====================== */

    const subscriber =
      await mailerlite.post(
        "/subscribers",
        {
          email,

          fields: {
            name,
          },

          status: "active",
        }
      );

    const subscriberId =
      subscriber.data.data.id;

    /* ======================
       ADD TO GROUP
    ====================== */

    await mailerlite.post(
        `/subscribers/${subscriberId}/groups/${groupId}`,
        {}
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        error:
          "Failed to add subscriber",
      },
      {
        status: 500,
      }
    );
  }
}