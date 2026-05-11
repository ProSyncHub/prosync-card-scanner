import { NextRequest, NextResponse } from "next/server";

import { Resend } from "resend";

import { connectDB } from "@/lib/mongodb";

import EmailHistory from "@/modules/email/email.model";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      recipients,
      subject,
      message,
    } = body;

    /* =========================
       VALIDATION
    ========================= */

    if (
      !recipients ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No recipients provided",
        },
        {
          status: 400,
        }
      );
    }

    if (!subject?.trim()) {
      return NextResponse.json(
        {
          error:
            "Subject is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        {
          error:
            "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       CLEAN EMAILS
    ========================= */

    const validRecipients =
      recipients
        .filter(Boolean)
        .map((email: string) =>
          email.trim()
        )
        .filter(
          (
            email: string,
            index: number,
            self: string[]
          ) =>
            self.indexOf(email) ===
            index
        );

    if (
      validRecipients.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid recipients found",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       SEND EMAIL
    ========================= */

    const result =
      await resend.emails.send({
        from:
          "Business Vault <onboarding@resend.dev>",

        to: validRecipients,

        subject,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            line-height: 1.7;
            color: #111827;
            padding: 24px;
          ">
            ${message.replace(
              /\n/g,
              "<br/>"
            )}

            <br/><br/>

            <div style="
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 13px;
            ">
              Sent via Business Vault CRM
            </div>
          </div>
        `,
      });

    /* =========================
       SAVE HISTORY
    ========================= */

    await connectDB();

    await EmailHistory.create({
      subject,

      message,

      recipients:
        validRecipients,

      recipientCount:
        validRecipients.length,

      status: "sent",

      provider: "resend",
    });

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json({
      success: true,

      recipientCount:
        validRecipients.length,

      result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to send emails",
      },
      {
        status: 500,
      }
    );
  }
}