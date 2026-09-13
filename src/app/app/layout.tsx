import { AppShell } from "@/components/app/AppShell";
import { getMyInvitationsCount } from "@/lib/data/trips";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const invitationCount = await getMyInvitationsCount();
  return <AppShell invitationCount={invitationCount}>{children}</AppShell>;
}
