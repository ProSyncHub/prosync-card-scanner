import { getCards } from "@/modules/business-card/services/get-cards";

import DashboardClient from "@/modules/business-card/components/DashboardClient";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function DashboardPage() {
  const cards = await getCards();

  return <DashboardClient cards={cards} />;
}