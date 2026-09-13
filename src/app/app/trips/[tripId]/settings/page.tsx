import Image from "next/image";
import { notFound } from "next/navigation";
import { ImageUpload } from "@/components/app/ImageUpload";
import { TripSettingsForm } from "@/components/app/TripSettingsForm";
import { updateTripCoverAction } from "@/app/app/trips/[tripId]/manage";
import { getTripSettings } from "@/lib/data/trips";

export default async function TripSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTripSettings(tripId);
  if (!trip) notFound();

  const coverPreview =
    trip.cover_image_url ??
    `https://picsum.photos/seed/${trip.cover_seed ?? tripId}/720/280`;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Cover */}
      <section>
        <h2 className="text-lg font-bold tracking-tight">Trip cover</h2>
        <div className="mt-3 overflow-hidden rounded-card ring-1 ring-border">
          <div className="relative h-40 w-full">
            <Image src={coverPreview} alt="Trip cover" fill sizes="100vw" className="object-cover" />
          </div>
        </div>
        <div className="mt-3">
          <ImageUpload
            bucket="trip-covers"
            folder={tripId}
            fieldName="coverUrl"
            extraFields={{ tripId }}
            action={updateTripCoverAction}
            label="Upload new cover"
          />
        </div>
      </section>

      {/* Details */}
      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight">Trip details</h2>
        <TripSettingsForm
          trip={{
            id: trip.id,
            name: trip.name,
            destination: trip.destination ?? "",
            description: trip.description ?? "",
            startDate: trip.start_date ?? "",
            endDate: trip.end_date ?? "",
            fundingDeadline: trip.funding_deadline ?? "",
            status: trip.status,
            target: trip.target_centavos ? String(trip.target_centavos / 100) : "",
            contributionMode: trip.contribution_mode,
          }}
        />
      </section>
    </div>
  );
}
