import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Card from "@/modules/business-card/model";

// Enable CORS for the other website
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allows any website to access this API
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: Request) {
  try {
    // 1. API Key Validation
    const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!apiKey || apiKey !== process.env.EXPORT_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing API key." },
        { status: 401, headers: corsHeaders }
      );
    }

    await connectDB();

    // Fetch all cards and use .lean() for better performance since we just want the JSON data
    const cards = await Card.find({}).sort({ createdAt: -1 }).lean();

    // Group the cards by category
    const groupedData: Record<string, any[]> = {};

    for (const card of cards) {
      const category = card.category || "Uncategorized";
      
      // Normalize casing to prevent separate groups for "Business" and "business"
      const trimmedCategory = category.trim();
      const formattedCategory =
        trimmedCategory.charAt(0).toUpperCase() + trimmedCategory.slice(1).toLowerCase();

      if (!groupedData[formattedCategory]) {
        groupedData[formattedCategory] = [];
      }
      groupedData[formattedCategory].push(card);
    }

    return NextResponse.json(groupedData, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
