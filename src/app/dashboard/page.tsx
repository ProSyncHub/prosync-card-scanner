import { getCards } from "@/modules/business-card/services/get-cards";

import DashboardClient from "@/modules/business-card/components/DashboardClient";

export default async function DashboardPage() {
  const cards = await getCards();

  return <DashboardClient cards={cards} />;
}