// app/api/mailerlite/campaigns/[id]/route.ts

import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const url = new URL(
    `/api/campaigns/${id}`,
    req.nextUrl.origin
  );

  return fetch(url, {
    method: "GET",
    headers: req.headers,
    cache: "no-store",
  });
}