import { Plus, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { AppHeader } from "@/components/app/AppHeader";
import { TripCard } from "@/components/app/TripCard";
import { ButtonLink } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { getDashboardTrips, getSessionProfile } from "@/lib/data/trips";
import { seedSampleTripAction } from "./actions";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [profile, trips] = await Promise.all([
    getSessionProfile(),
    getDashboardTrips(),
  ]);
  const name = profile?.name ?? "there";

  if (trips.length === 0) {
    return (
      <div className="px-5 py-6 sm:px-8 sm:py-10">
        <AppHeader eyebrow={`${greeting()}, ${name}`} title="Your trips" />
        <div className="mx-auto mt-10 max-w-md rounded-card bg-surface p-8 text-center ring-1 ring-border shadow-soft-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Sparkle size={28} weight="duotone" />
          </span>
          <h2 className="mt-5 text-xl font-bold tracking-tight">
            No trips yet
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
            Start planning something with your group. You can create a trip from
            scratch, or drop in a sample trip to explore how everything fits
            together.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <ButtonLink href="/app/trips/new" size="lg" trailingIcon>
              Create your first trip
            </ButtonLink>
            <form action={seedSampleTripAction}>
              <button
                type="submit"
                className="rounded-pill px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
              >
                Add a sample trip
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Personal snapshot from the first trip the user participates in.
  const mine = trips.find((t) =>
    t.members.some((m) => m.name === name && m.target > 0),
  );
  const me = mine?.members.find((m) => m.name === name);
  const myRemaining = me ? Math.max(0, me.target - me.paid) : 0;

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10">
      <AppHeader
        eyebrow={`${greeting()}, ${name}`}
        title="Your trips"
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

      {mine && me && (
        <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
          <StaggerItem className="rounded-card bg-accent p-5 text-accent-fg shadow-soft-md">
            <p className="text-sm text-accent-fg/85">Your share still to pay</p>
            <Money centavos={myRemaining} size="lg" className="mt-1 block" animate />
            <p className="mt-1 text-sm text-accent-fg/85">for {mine.name}</p>
          </StaggerItem>
          <StaggerItem className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
            <p className="text-sm text-text-muted">You&rsquo;ve contributed</p>
            <Money centavos={me.paid} size="lg" className="mt-1 block" animate />
            <p className="mt-1 text-sm text-text-secondary">verified so far</p>
          </StaggerItem>
          <StaggerItem className="rounded-card bg-surface p-5 ring-1 ring-border shadow-soft-sm">
            <p className="text-sm text-text-muted">Active trips</p>
            <p className="tnum mt-1 text-3xl font-bold">{trips.length}</p>
            <p className="mt-1 text-sm text-text-secondary">across your groups</p>
          </StaggerItem>
        </Stagger>
      )}

      <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
        {trips.map((trip) => (
          <StaggerItem key={trip.id}>
            <TripCard trip={trip} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
