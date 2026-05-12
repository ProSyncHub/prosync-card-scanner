import { NextResponse } from "next/server";

import mailerlite from "@/lib/mailerlite";

export async function GET() {
  try {
    const groupId =
      process.env
        .MAILERLITE_GROUP_ID;

    const response =
      await mailerlite.get(
        `/groups/${groupId}/subscribers`
      );

    return NextResponse.json({
      success: true,

      members:
        response.data.data || [],
    });
  } catch (error: any) {
    console.error(
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch group members",
      },
      {
        status: 500,
      }
    );
  }
}