import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";

import Card from "@/modules/business-card/model";

import { verifyToken } from "@/lib/auth";

function checkPassword(password?: string) {
  return (
    password &&
    password ===
      process.env.INTERNAL_ADMIN_PASSWORD
  );
}

function getIdFromUrl(req: NextRequest) {
  const parts = req.nextUrl.pathname.split("/");

  return parts[parts.length - 1];
}

export async function DELETE(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("vault_auth")?.value;

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!checkPassword(body.password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 403 }
      );
    }

    const id = getIdFromUrl(req);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        { error: "Invalid card ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted =
      await Card.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("vault_auth")?.value;

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!checkPassword(body.password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 403 }
      );
    }

    const id = getIdFromUrl(req);

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        { error: "Invalid card ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const updated =
      await Card.findByIdAndUpdate(
        id,
        {
          $set: {
            front: body.front,
            back: body.back,
            category: body.category,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}