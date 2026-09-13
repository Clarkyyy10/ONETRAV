import { AppHeader } from "@/components/app/AppHeader";
import { ComingSoon } from "@/components/app/ComingSoon";

export default function GroupsPage() {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10">
      <AppHeader title="Groups" />
      <ComingSoon
        title="Group management is on the way"
        body="Soon you'll create groups, invite friends, and reuse the same crew across every trip you plan together."
      />
    </div>
  );
}
