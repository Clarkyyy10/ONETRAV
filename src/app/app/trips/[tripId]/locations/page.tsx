import Link from "next/link";
import { MapPin, ArrowSquareOut, MapTrifold } from "@phosphor-icons/react/dist/ssr";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { getTripItinerary, type ItineraryItemRaw } from "@/lib/data/trips";

function mapHref(item: ItineraryItemRaw): string | null {
  if (item.map_link) return item.map_link;
  if (item.location)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;
  return null;
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const days = await getTripItinerary(tripId);

  const located = days
    .map((d) => ({
      ...d,
      items: d.items.filter((i) => i.location || i.map_link),
    }))
    .filter((d) => d.items.length > 0);

  if (located.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <MapTrifold size={28} weight="duotone" />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-tight">No locations yet</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          Add a location or Google Maps link to your itinerary stops, and the
          group&rsquo;s saved destinations will show up here as one route.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href={`/app/trips/${tripId}/itinerary`}>
            <Button trailingIcon>Go to itinerary</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <p className="text-[15px] text-text-secondary">
        Everyone&rsquo;s saved destinations in order. Tap any stop to open the
        exact spot in Google Maps for navigation.
      </p>

      {located.map((day, dayIndex) => (
        <section key={day.id}>
          <h2 className="text-lg font-extrabold tracking-tight">
            {day.title || `Day ${dayIndex + 1}`}
          </h2>
          <ol className="mt-4 space-y-3 border-l border-border pl-5">
            {day.items.map((item) => {
              const href = mapHref(item)!;
              return (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[27px] top-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-fg ring-2 ring-surface">
                    <MapPin size={11} weight="fill" />
                  </span>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-card bg-surface p-4 ring-1 ring-border shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.7rem] bg-accent-soft text-accent">
                      <CategoryIcon category={item.category} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <p className="truncate text-sm text-text-muted">
                        {item.location || "Saved map link"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
                      Open
                      <ArrowSquareOut size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
