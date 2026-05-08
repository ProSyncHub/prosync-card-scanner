import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Card from "@/modules/business-card/model";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const rows = body.rows || [];

    await connectDB();

    const documents = rows.map(
      (row: any) => ({
        front: {
          name: row.name || "",
          company:
            row.company || "",
          title: row.title || "",
          phone: row.phone
            ? [row.phone]
            : [],
          email: row.email
            ? [row.email]
            : [],
          website:
            row.website || "",
          address:
            row.address || "",
          qrData: [],
        },

        back: {},

        category:
          row.category ||
          "Uncategorized",

        isTranslated: false,

        originalLanguage:
          "English",
      })
    );

    const inserted =
      await Card.insertMany(
        documents
      );

    return NextResponse.json({
      success: true,

      inserted:
        inserted.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Import failed",
      },
      {
        status: 500,
      }
    );
  }
}