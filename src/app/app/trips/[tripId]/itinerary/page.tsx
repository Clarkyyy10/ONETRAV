import { getTripItinerary } from "@/lib/data/trips";
import { ItineraryEditor } from "@/components/app/ItineraryEditor";

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const days = await getTripItinerary(tripId);

  return <ItineraryEditor tripId={tripId} days={days} />;
}
