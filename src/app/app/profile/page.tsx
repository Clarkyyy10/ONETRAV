import Image from "next/image";
import { SignOut, IdentificationBadge } from "@phosphor-icons/react/dist/ssr";
import { AppHeader } from "@/components/app/AppHeader";
import { ProfileNameForm } from "@/components/app/ProfileNameForm";
import { ImageUpload } from "@/components/app/ImageUpload";
import { getSessionProfile } from "@/lib/data/trips";
import { signOutAction } from "@/app/auth/actions";
import { updateAvatarAction } from "./actions";
import { initials } from "@/lib/format";

export default async function ProfilePage() {
  const profile = await getSessionProfile();
  const name = profile?.name ?? "You";

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10">
      <AppHeader title="Profile" />

      <div className="mt-6 max-w-md space-y-6">
        {/* Identity */}
        <div className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-accent">
                {initials(name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight">{name}</p>
              <p className="tnum inline-flex items-center gap-1 text-sm text-text-muted">
                <IdentificationBadge size={15} weight="fill" />
                {profile?.publicId}
              </p>
            </div>
          </div>
          <div className="mt-4">
            {profile && (
              <ImageUpload
                bucket="avatars"
                folder={profile.id}
                fieldName="avatarUrl"
                action={updateAvatarAction}
                label="Change photo"
              />
            )}
          </div>
        </div>

        {/* Unique ID callout */}
        <div className="rounded-card bg-accent-soft p-5">
          <p className="text-sm font-semibold text-accent">Your unique ID</p>
          <p className="tnum mt-1 text-2xl font-extrabold tracking-tight text-accent">
            {profile?.publicId}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Share this so friends can find and invite the real you, even if you
            share a name with someone else.
          </p>
        </div>

        {/* Edit name */}
        <div className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
          <ProfileNameForm name={name} />
        </div>

        {/* Sign out */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-pill bg-surface-2 px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <SignOut size={18} weight="bold" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
