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

    const { subscriberId } =
      body;

    const groupId =
      process.env
        .MAILERLITE_GROUP_ID;

    await mailerlite.delete(
      `/groups/${groupId}/subscribers/${subscriberId}`
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
          "Failed to remove subscriber",
      },
      {
        status: 500,
      }
    );
  }
}