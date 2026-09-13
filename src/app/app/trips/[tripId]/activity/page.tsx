import {
  CheckCircle,
  SealCheck,
  PencilSimple,
  UserPlus,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import { getTripActivity } from "@/lib/data/trips";

const kindIcon: Record<string, React.ReactNode> = {
  contribution: <CheckCircle size={18} weight="fill" className="text-accent" />,
  verified: <SealCheck size={18} weight="fill" className="text-success" />,
  budget: <PencilSimple size={18} weight="fill" className="text-warning" />,
  expense: <Receipt size={18} weight="fill" className="text-text-secondary" />,
  member: <UserPlus size={18} weight="fill" className="text-accent" />,
};

export default async function TripActivityPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const entries = await getTripActivity(tripId);

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h2 className="text-xl font-bold tracking-tight">No activity yet</h2>
        <p className="mt-2 text-[15px] text-text-secondary">
          Every change to the plan, budget, and money shows up here so the whole
          group can see what happened and when.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ul className="space-y-1">
        {entries.map((a) => (
          <li key={a.id} className="flex items-start gap-3 rounded-control px-3 py-3 hover:bg-surface-2/60">
            <span className="mt-0.5 shrink-0">{kindIcon[a.kind] ?? kindIcon.budget}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-semibold">{a.actorName}</span>{" "}
                <span className="text-text-secondary">{a.text}</span>
              </p>
              <p className="text-xs text-text-muted">{a.when}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
