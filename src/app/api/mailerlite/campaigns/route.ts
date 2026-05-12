import { NextResponse } from "next/server";

import mailerlite from "@/lib/mailerlite";

export async function GET() {
  try {
    const response =
      await mailerlite.get(
        "/campaigns"
      );

    return NextResponse.json({
      success: true,

      data:
        response.data?.data ||
        [],
    });
  } catch (error: any) {
    console.error(
      error?.response?.data ||
        error
    );

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