import Link from "next/link";
import Image from "next/image";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Money } from "@/components/ui/Money";
import type { Trip } from "@/lib/mock";
import { fundingPercent } from "@/lib/money";

export function TripCard({ trip }: { trip: Trip }) {
  const pct = fundingPercent(trip.raised, trip.target);
  const stillNeeded = Math.max(0, trip.target - trip.raised);
  const isFunding = trip.target > 0;

  return (
    <Link
      href={`/app/trips/${trip.id}`}
      className="group block overflow-hidden rounded-card bg-surface ring-1 ring-border shadow-soft-sm ease-fluid transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={trip.coverImageUrl ?? `https://picsum.photos/seed/${trip.coverSeed}/720/320`}
          alt={`${trip.destination}`}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover ease-fluid transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={trip.status} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight">{trip.name}</h3>
            <p className="text-sm text-text-muted">
              {trip.dateRange} · {trip.destination}
            </p>
          </div>
          <span className="mt-1 text-text-muted transition-transform duration-300 group-hover:translate-x-0.5">
            <CaretRight size={18} weight="bold" />
          </span>
        </div>

        {isFunding ? (
          <div className="mt-4">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1.5">
                <Money centavos={trip.raised} size="md" />
                <span className="text-sm text-text-muted">
                  of <Money centavos={trip.target} size="sm" muted />
                </span>
              </div>
              <span className="tnum text-sm font-bold text-accent">{pct}%</span>
            </div>
            <ProgressBar
              value={pct}
              label={`${trip.name} funding progress`}
              className="mt-2.5"
            />
            <p className="mt-2.5 text-sm text-text-secondary">
              <Money centavos={stillNeeded} size="sm" /> still needed
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-secondary">
            Still planning. Add an itinerary and budget to set the target.
          </p>
        )}
      </div>
    </Link>
  );
}
