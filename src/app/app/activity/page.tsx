import { AppHeader } from "@/components/app/AppHeader";
import { ComingSoon } from "@/components/app/ComingSoon";

export default function ActivityPage() {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10">
      <AppHeader title="Activity" />
      <ComingSoon
        title="Your activity feed is on the way"
        body="Every contribution, verification, and budget change across your trips will show up here as a clear, auditable history."
      />
    </div>
  );
}
