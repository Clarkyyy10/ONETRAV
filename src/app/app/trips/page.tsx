import { Plus } from "@phosphor-icons/react/dist/ssr";
import { AppHeader } from "@/components/app/AppHeader";
import { TripCard } from "@/components/app/TripCard";
import { ButtonLink } from "@/components/ui/Button";
import { ComingSoon } from "@/components/app/ComingSoon";
import { getDashboardTrips } from "@/lib/data/trips";

export default async function TripsPage() {
  const trips = await getDashboardTrips();

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10">
      <AppHeader
        title="Trips"
        action={
          <ButtonLink
            href="/app/trips/new"
            size="md"
            className="hidden sm:inline-flex"
          >
            <Plus size={18} weight="bold" className="mr-1" />
            Create trip
          </ButtonLink>
        }
      />
      {trips.length === 0 ? (
        <ComingSoon
          title="No trips yet"
          body="Create your first trip to start planning and saving together."
        />
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
