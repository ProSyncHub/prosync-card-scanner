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

    const {
      subscriberId,
      email,
      name,
    } = body;

    await mailerlite.put(
      `/subscribers/${subscriberId}`,
      {
        email,

        fields: {
          name,
        },
      }
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
          "Failed to update subscriber",
      },
      {
        status: 500,
      }
    );
  }
}