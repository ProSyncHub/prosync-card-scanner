import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

import cloudinary from "@/lib/cloudinary";

import { connectDB } from "@/lib/mongodb";

import Card from "@/modules/business-card/model";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VALID_CATEGORIES = [
  "Business",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Logistics",
  "Government",
  "Legal",
  "Hospitality",
  "Real Estate",
  "Uncategorized",
];

export async function POST(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const file =
      formData.get("file") as File;

    const text =
      formData.get("text") as string;

    const qrData = JSON.parse(
      (formData.get("qrData") as string) ||
        "[]"
    );

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================
       CONVERT FILE
    ========================================= */

    const bytes =
      await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    /* =========================================
       CLOUDINARY UPLOAD
    ========================================= */

    const uploaded =
      await new Promise<any>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder:
                  "business-cards",
              },

              (error, result) => {
                if (error)
                  reject(error);

                else resolve(result);
              }
            )
            .end(buffer);
        }
      );

    /* =========================================
       OPENAI EXTRACTION
    ========================================= */

    const prompt = `
You are an advanced multilingual business card extraction engine.

Your task is to extract structured contact information from OCR text and QR payloads coming from scanned business cards.

The OCR may contain:
- noise
- duplicate lines
- broken formatting
- multilingual text
- partial translations
- OCR mistakes

You must intelligently reconstruct the correct business card information.

========================================
STRICT EXTRACTION RULES
========================================

1. Extract ONLY information that clearly exists.
2. NEVER hallucinate missing data.
3. NEVER invent phone numbers, emails, names, titles, companies, or addresses.
4. If data is missing, return empty string or empty array.
5. Remove OCR garbage and random symbols.
6. Merge duplicate information cleanly.
7. Translate ALL extracted fields into English if original text is not English.
8. Preserve original language in "originalLanguage".
9. If source language is already English:
   - originalLanguage = "English"
   - isTranslated = false
10. If translated:
   - isTranslated = true
11. Detect language intelligently.
12. QR data may contain:
   - URLs
   - VCARD payloads
   - WeChat links
   - contact information
   - encoded business data
13. Use QR data to improve extraction accuracy.
14. Category MUST ONLY be one of these exact values:

${VALID_CATEGORIES.join(", ")}

15. If uncertain about category:
   return "Uncategorized"

========================================
RETURN STRICT JSON ONLY
========================================

Use EXACT structure:

{
  "name": "",
  "company": "",
  "title": "",
  "phones": [],
  "emails": [],
  "website": "",
  "address": "",
  "category": "",
  "originalLanguage": "",
  "translatedEnglishText": "",
  "isTranslated": false
}

========================================
OCR TEXT
========================================

${text}

========================================
QR DATA
========================================

${JSON.stringify(qrData, null, 2)}
`;

    const completion =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        response_format: {
          type: "json_object",
        },
      });

    const content =
      completion.choices[0].message
        .content || "{}";

    const extracted =
      JSON.parse(content);

    /* =========================================
       CLEAN CATEGORY
    ========================================= */

    const category =
      VALID_CATEGORIES.includes(
        extracted.category
      )
        ? extracted.category
        : "Uncategorized";

    /* =========================================
       SAVE TO DB
    ========================================= */

    await connectDB();

    const saved = await Card.create({
      front: {
        name:
          extracted.name || "",

        company:
          extracted.company || "",

        title:
          extracted.title || "",

        phone:
          extracted.phones || [],

        email:
          extracted.emails || [],

        website:
          extracted.website || "",

        address:
          extracted.address || "",

        qrData,
      },

      back: {},

      category,

      frontImageUrl:
        uploaded.secure_url,

      isTranslated:
        extracted.isTranslated ||
        false,

      originalLanguage:
        extracted.originalLanguage ||
        "English",

      translationNote:
        extracted.translatedEnglishText ||
        "",
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Scan failed",
      },
      {
        status: 500,
      }
    );
  }
}