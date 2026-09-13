import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, GearSix } from "@phosphor-icons/react/dist/ssr";
import { StatusBadge } from "@/components/ui/Badge";
import { TripTabs } from "@/components/app/TripTabs";
import { getTripView } from "@/lib/data/trips";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTripView(tripId);
  if (!trip) notFound();

  return (
    <div>
      {/* Trip banner */}
      <div className="relative h-44 w-full sm:h-56">
        <Image
          src={trip.coverImageUrl ?? `https://picsum.photos/seed/${trip.coverSeed}/1200/480`}
          alt={trip.destination}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-pill bg-black/30 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/45"
          >
            <ArrowLeft size={16} weight="bold" />
            Trips
          </Link>
          <Link
            href={`/app/trips/${trip.id}/settings`}
            className="inline-flex items-center gap-1.5 rounded-pill bg-black/30 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/45"
          >
            <GearSix size={16} weight="bold" />
            Settings
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <StatusBadge status={trip.status} />
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {trip.name}
          </h1>
          <p className="text-sm text-white/85">
            {trip.dateRange} · {trip.destination}
          </p>
        </div>
      </div>

      <div className="px-5 pt-4 sm:px-8">
        <TripTabs tripId={trip.id} />
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
