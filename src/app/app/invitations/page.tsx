import Image from "next/image";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { AppHeader } from "@/components/app/AppHeader";
import { InviteResponseButtons } from "@/components/app/InviteResponseButtons";
import { getMyInvitations } from "@/lib/data/trips";

export default async function InvitationsPage() {
  const invites = await getMyInvitations();

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10">
      <AppHeader title="Invitations" />

      {invites.length === 0 ? (
        <div className="mx-auto mt-10 max-w-md rounded-card bg-surface p-8 text-center ring-1 ring-border shadow-soft-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
            <EnvelopeSimple size={26} weight="duotone" />
          </span>
          <h2 className="mt-5 text-xl font-bold tracking-tight">No invitations</h2>
          <p className="mt-2 text-[15px] text-text-secondary">
            When someone invites you to a trip, it will show up here for you to
            accept or decline.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="overflow-hidden rounded-card bg-surface ring-1 ring-border shadow-soft-sm"
            >
              <div className="relative h-28 w-full">
                <Image
                  src={`https://picsum.photos/seed/${inv.coverSeed}/720/240`}
                  alt={inv.destination ?? inv.tripName}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-text">{inv.inviterName}</span>{" "}
                  invited you to join
                </p>
                <h3 className="mt-0.5 text-lg font-bold tracking-tight">{inv.tripName}</h3>
                <p className="text-sm text-text-muted">
                  {inv.dateRange}
                  {inv.destination ? ` · ${inv.destination}` : ""}
                </p>
                <InviteResponseButtons inviteId={inv.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
