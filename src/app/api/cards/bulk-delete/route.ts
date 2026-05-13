import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";

import Card from "@/modules/business-card/model";

import { verifyToken } from "@/lib/auth";

function checkPassword(
  password?: string
) {
  return (
    password &&
    password ===
      process.env
        .INTERNAL_ADMIN_PASSWORD
  );
}

export async function DELETE(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get(
        "vault_auth"
      )?.value;

    if (
      !token ||
      !verifyToken(token)
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await req.json();

    if (
      !checkPassword(
        body.password
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid password",
        },
        {
          status: 403,
        }
      );
    }

    const ids = body.ids;

    if (
      !Array.isArray(ids) ||
      ids.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No card IDs provided",
        },
        {
          status: 400,
        }
      );
    }

    const validIds =
      ids.filter((id) =>
        mongoose.Types.ObjectId.isValid(
          id
        )
      );

    if (
      validIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid IDs",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const result =
      await Card.deleteMany({
        _id: {
          $in: validIds,
        },
      });

    return NextResponse.json({
      success: true,

      deletedCount:
        result.deletedCount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Bulk delete failed",
      },
      {
        status: 500,
      }
    );
  }
}