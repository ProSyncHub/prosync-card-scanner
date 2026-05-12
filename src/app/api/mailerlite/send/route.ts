import {
  NextRequest,
  NextResponse,
} from "next/server";

import mailerlite from "@/lib/mailerlite";
import Campaign from "@/modules/email/campaign.model";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      emails,
      subject,
      message,
    } = body;

    if (
      !emails ||
      emails.length === 0
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

    const groupId =
      process.env
        .MAILERLITE_GROUP_ID;

    if (!groupId) {
      return NextResponse.json(
        {
          error:
            "MAILERLITE_GROUP_ID missing",
        },
        {
          status: 500,
        }
      );
    }

    /* =========================
       CREATE / UPDATE SUBSCRIBERS
    ========================= */

    for (const email of emails) {
      if (!email) continue;

      try {
        const subscriber =
          await mailerlite.post(
            "/subscribers",
            {
              email,

              status:
                "active",
            }
          );

        const subscriberId =
          subscriber.data.data.id;

        /* =========================
           ADD TO GROUP
        ========================= */

        await mailerlite.post(
          `/groups/${groupId}/subscribers`,
          {
            subscriber_id:
              subscriberId,
          }
        );
      } catch (err) {
        console.error(
          "Subscriber sync failed:",
          email
        );
      }
    }

    /* =========================
       CREATE CAMPAIGN
    ========================= */

    const campaign =
      await mailerlite.post(
        "/campaigns",
        {
          name: subject,

          type: "regular",

          groups: [groupId],

          emails: [
            {
              subject,

              from_name:
                "Business Vault",

              from:
                "your@email.com",

              content: message,
            },
          ],
        }
      );

    const campaignId =
        campaign.data.data.id;


        await Campaign.create({
    mailerliteId: campaignId,

    subject,

    message,

    recipients: emails.map(
        (email: string) => ({
        email,
        })
    ),

    status: "sent",
    });

    /* =========================
       SEND CAMPAIGN
    ========================= */

    await mailerlite.post(
      `/campaigns/${campaignId}/schedule`,
      {
        delivery: "instant",
      }
    );

    return NextResponse.json({
      success: true,

      campaignId,
    });
  } catch (error: any) {
    console.error(
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        error:
          "MailerLite campaign failed",
      },
      {
        status: 500,
      }
    );
  }
}