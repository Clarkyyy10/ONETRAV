import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  initials,
  timeAgo,
  formatDateRange,
  toViewStatus,
  toViewCategory,
} from "@/lib/format";
import type {
  Trip,
  Member,
  BudgetLine,
  ItineraryDay,
  ActivityEntry,
} from "@/lib/mock";
import type { Enums } from "@/lib/database.types";

export interface SessionProfile {
  id: string;
  name: string;
  publicId: string;
  avatarUrl: string | null;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, public_id, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return { id: user.id, name: user.email ?? "You", publicId: "", avatarUrl: null };
  }
  return {
    id: profile.id,
    name: profile.name,
    publicId: profile.public_id,
    avatarUrl: profile.avatar_url,
  };
}

// ---- Row shapes for the nested selects ----
interface ContributionRow {
  amount_centavos: number;
  status: Enums<"contribution_status">;
  member_user_id: string;
}
interface TripMemberRow {
  user_id: string;
  contribution_target_centavos: number;
  profiles: { id?: string; name: string } | null;
}
interface BudgetRow {
  id: string;
  category: Enums<"item_category">;
  name: string;
  estimated_centavos: number;
  actual_centavos: number | null;
}
interface ItineraryItemRow {
  id: string;
  start_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  category: Enums<"item_category">;
  estimated_centavos: number;
  sort_order: number;
}
interface ItineraryDayRow {
  id: string;
  title: string | null;
  date: string | null;
  sort_order: number;
  itinerary_items: ItineraryItemRow[];
}
interface ActivityRow {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
interface TripListRow {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  status: Enums<"trip_status">;
  cover_seed: string | null;
  cover_image_url: string | null;
  target_centavos: number;
  trip_members: TripMemberRow[];
  contributions: ContributionRow[];
  budget_items: { actual_centavos: number | null }[];
}
interface TripDetailRow extends Omit<TripListRow, "budget_items"> {
  budget_items: BudgetRow[];
  itinerary_days: ItineraryDayRow[];
  activity_logs: ActivityRow[];
}

function verifiedTotal(contributions: ContributionRow[]): number {
  return contributions
    .filter((c) => c.status === "verified")
    .reduce((sum, c) => sum + c.amount_centavos, 0);
}

function buildMembers(
  members: TripMemberRow[],
  contributions: ContributionRow[],
): Member[] {
  return members.map((m) => {
    const paid = contributions
      .filter((c) => c.member_user_id === m.user_id && c.status === "verified")
      .reduce((sum, c) => sum + c.amount_centavos, 0);
    const name = m.profiles?.name ?? "Member";
    return {
      id: m.user_id,
      name,
      initials: initials(name),
      target: m.contribution_target_centavos,
      paid,
    };
  });
}

function coverSeedFor(row: { cover_seed: string | null; id: string }): string {
  return row.cover_seed ?? `trip-${row.id}`;
}

/** Trips visible to the current user, shaped for list/card views. */
export async function getDashboardTrips(): Promise<Trip[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "id,name,destination,start_date,end_date,status,cover_seed,cover_image_url,target_centavos, trip_members(user_id,contribution_target_centavos,profiles(id,name)), contributions(amount_centavos,status,member_user_id), budget_items(actual_centavos)",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = data as unknown as TripListRow[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    destination: row.destination ?? "",
    dateRange: formatDateRange(row.start_date, row.end_date),
    status: toViewStatus(row.status),
    coverSeed: coverSeedFor(row),
    coverImageUrl: row.cover_image_url,
    target: row.target_centavos,
    raised: verifiedTotal(row.contributions),
    spent: row.budget_items.reduce((s, b) => s + (b.actual_centavos ?? 0), 0),
    members: buildMembers(row.trip_members, row.contributions),
    budget: [],
    itinerary: [],
    activity: [],
  }));
}

/** Full trip detail for the overview / itinerary / budget / contributions pages. */
export async function getTripView(tripId: string): Promise<Trip | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "id,name,destination,start_date,end_date,status,cover_seed,cover_image_url,target_centavos, trip_members(user_id,contribution_target_centavos,profiles(id,name)), contributions(amount_centavos,status,member_user_id), budget_items(id,category,name,estimated_centavos,actual_centavos), itinerary_days(id,title,date,sort_order,itinerary_items(id,start_time,title,description,location,category,estimated_centavos,sort_order)), activity_logs(id,action,metadata,created_at)",
    )
    .eq("id", tripId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as TripDetailRow;

  const budget: BudgetLine[] = row.budget_items.map((b) => ({
    id: b.id,
    category: toViewCategory(b.category),
    name: b.name,
    estimated: b.estimated_centavos,
    actual: b.actual_centavos,
  }));

  const days = [...row.itinerary_days].sort((a, b) => a.sort_order - b.sort_order);
  const itinerary: ItineraryDay[] = days.map((d, i) => ({
    id: d.id,
    label: d.title ?? `Day ${i + 1}`,
    date: d.date
      ? new Date(d.date).toLocaleDateString("en-PH", {
          month: "long",
          day: "numeric",
        })
      : "",
    items: [...d.itinerary_items]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((it) => ({
        id: it.id,
        time: it.start_time ?? "",
        title: it.title,
        detail: it.description ?? it.location ?? "",
        category: toViewCategory(it.category),
        amount: it.estimated_centavos,
      })),
  }));

  const activity: ActivityEntry[] = [...row.activity_logs]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      kind: (a.metadata?.kind as ActivityEntry["kind"]) ?? "budget",
      text: (a.metadata?.text as string) ?? a.action,
      when: timeAgo(a.created_at),
    }));

  return {
    id: row.id,
    name: row.name,
    destination: row.destination ?? "",
    dateRange: formatDateRange(row.start_date, row.end_date),
    status: toViewStatus(row.status),
    coverSeed: coverSeedFor(row),
    coverImageUrl: row.cover_image_url,
    target: row.target_centavos,
    raised: verifiedTotal(row.contributions),
    spent: row.budget_items.reduce((s, b) => s + (b.actual_centavos ?? 0), 0),
    members: buildMembers(row.trip_members, row.contributions),
    budget,
    itinerary,
    activity,
  };
}

export interface ContributionListItem {
  id: string;
  memberName: string;
  memberInitials: string;
  amount: number;
  status: Enums<"contribution_status">;
  method: string | null;
  when: string;
  isMine: boolean;
}

/** Contributions for a trip, newest first, with member display info. */
export async function getTripContributions(
  tripId: string,
): Promise<ContributionListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("contributions")
    .select("id, amount_centavos, status, payment_method, submitted_at, member_user_id, profiles:member_user_id(name)")
    .eq("trip_id", tripId)
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];

  interface Row {
    id: string;
    amount_centavos: number;
    status: Enums<"contribution_status">;
    payment_method: string | null;
    submitted_at: string;
    member_user_id: string;
    profiles: { name: string } | null;
  }
  return (data as unknown as Row[]).map((r) => {
    const name = r.profiles?.name ?? "Member";
    return {
      id: r.id,
      memberName: name,
      memberInitials: initials(name),
      amount: r.amount_centavos,
      status: r.status,
      method: r.payment_method,
      when: timeAgo(r.submitted_at),
      isMine: r.member_user_id === user?.id,
    };
  });
}

/** The current user's context for a trip: id + whether they can manage finances. */
export async function getMyTripContext(
  tripId: string,
): Promise<{ userId: string | null; canManageFinance: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, canManageFinance: false };

  const { data: trip } = await supabase
    .from("trips")
    .select("group_id")
    .eq("id", tripId)
    .maybeSingle();
  if (!trip) return { userId: user.id, canManageFinance: false };

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", trip.group_id)
    .eq("user_id", user.id)
    .maybeSingle();

  const role = membership?.role;
  return {
    userId: user.id,
    canManageFinance:
      role === "owner" || role === "admin" || role === "treasurer",
  };
}

export interface ItineraryItemRaw {
  id: string;
  itinerary_day_id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  map_link: string | null;
  notes: string | null;
  category: string;
  cost_type: "fixed" | "per_person" | "quantity";
  quantity: number;
  unit_price_centavos: number;
  estimated_centavos: number;
  actual_centavos: number | null;
  status: string;
  sort_order: number;
}
export interface ItineraryDayRaw {
  id: string;
  title: string | null;
  date: string | null;
  sort_order: number;
  items: ItineraryItemRaw[];
}

/** Raw itinerary (days + items) for the editable itinerary and locations views. */
export async function getTripItinerary(
  tripId: string,
): Promise<ItineraryDayRaw[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("itinerary_days")
    .select(
      "id,title,date,sort_order, itinerary_items(id,itinerary_day_id,title,description,start_time,end_time,location,map_link,notes,category,cost_type,quantity,unit_price_centavos,estimated_centavos,actual_centavos,status,sort_order)",
    )
    .eq("trip_id", tripId)
    .order("sort_order");

  if (error || !data) return [];

  interface DayRow {
    id: string;
    title: string | null;
    date: string | null;
    sort_order: number;
    itinerary_items: ItineraryItemRaw[];
  }
  return (data as unknown as DayRow[]).map((d) => ({
    id: d.id,
    title: d.title,
    date: d.date,
    sort_order: d.sort_order,
    items: [...d.itinerary_items].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

/* ============================ Members ============================ */
export interface MemberCard {
  id: string;
  name: string;
  publicId: string;
  avatarUrl: string | null;
  role: Enums<"member_role">;
  target: number;
  paid: number;
  participation: string;
  isCreator: boolean;
}

export async function getTripMembers(tripId: string): Promise<MemberCard[]> {
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("group_id, created_by")
    .eq("id", tripId)
    .maybeSingle();
  if (!trip) return [];

  const [{ data: gm }, { data: tm }, { data: contribs }] = await Promise.all([
    supabase
      .from("group_members")
      .select("user_id, role, profiles(name, public_id, avatar_url)")
      .eq("group_id", trip.group_id)
      .eq("status", "active"),
    supabase
      .from("trip_members")
      .select("user_id, contribution_target_centavos, participation_status")
      .eq("trip_id", tripId),
    supabase
      .from("contributions")
      .select("member_user_id, amount_centavos, status")
      .eq("trip_id", tripId),
  ]);

  interface GmRow {
    user_id: string;
    role: Enums<"member_role">;
    profiles: { name: string; public_id: string; avatar_url: string | null } | null;
  }
  const tmByUser = new Map(
    (tm ?? []).map((r) => [r.user_id, r]),
  );
  const paidByUser = new Map<string, number>();
  for (const c of contribs ?? []) {
    if (c.status === "verified") {
      paidByUser.set(
        c.member_user_id,
        (paidByUser.get(c.member_user_id) ?? 0) + c.amount_centavos,
      );
    }
  }

  return ((gm as unknown as GmRow[]) ?? []).map((m) => {
    const tmRow = tmByUser.get(m.user_id);
    return {
      id: m.user_id,
      name: m.profiles?.name ?? "Member",
      publicId: m.profiles?.public_id ?? "",
      avatarUrl: m.profiles?.avatar_url ?? null,
      role: m.role,
      target: tmRow?.contribution_target_centavos ?? 0,
      paid: paidByUser.get(m.user_id) ?? 0,
      participation: tmRow?.participation_status ?? "going",
      isCreator: m.user_id === trip.created_by,
    };
  });
}

/* ============================ Invitations ============================ */
export interface PendingInvite {
  id: string;
  inviteeName: string;
  inviteePublicId: string;
  role: Enums<"member_role">;
  when: string;
}

export async function getTripInvitations(tripId: string): Promise<PendingInvite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invitations")
    .select("id, role, created_at, profiles:invitee_id(name, public_id)")
    .eq("trip_id", tripId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  interface Row {
    id: string;
    role: Enums<"member_role">;
    created_at: string;
    profiles: { name: string; public_id: string } | null;
  }
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    inviteeName: r.profiles?.name ?? "Someone",
    inviteePublicId: r.profiles?.public_id ?? "",
    role: r.role,
    when: timeAgo(r.created_at),
  }));
}

export interface IncomingInvite {
  id: string;
  tripId: string;
  tripName: string;
  destination: string | null;
  dateRange: string;
  coverSeed: string;
  inviterName: string;
  when: string;
}

export async function getMyInvitations(): Promise<IncomingInvite[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("invitations")
    .select(
      "id, created_at, trip_id, trips(name, destination, start_date, end_date, cover_seed), inviter:inviter_id(name)",
    )
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  interface Row {
    id: string;
    created_at: string;
    trip_id: string;
    trips: {
      name: string;
      destination: string | null;
      start_date: string | null;
      end_date: string | null;
      cover_seed: string | null;
    } | null;
    inviter: { name: string } | null;
  }
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    tripId: r.trip_id,
    tripName: r.trips?.name ?? "A trip",
    destination: r.trips?.destination ?? null,
    dateRange: formatDateRange(r.trips?.start_date ?? null, r.trips?.end_date ?? null),
    coverSeed: r.trips?.cover_seed ?? `trip-${r.trip_id}`,
    inviterName: r.inviter?.name ?? "Someone",
    when: timeAgo(r.created_at),
  }));
}

export async function getMyInvitationsCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("invitee_id", user.id)
    .eq("status", "pending");
  return count ?? 0;
}

/* ============================ Expenses ============================ */
export interface ExpenseRow {
  id: string;
  description: string;
  category: string;
  amount: number;
  paidByName: string;
  date: string | null;
}

export async function getTripExpenses(tripId: string): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("id, description, category, amount_centavos, expense_date, profiles:paid_by(name)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  interface Row {
    id: string;
    description: string;
    category: string;
    amount_centavos: number;
    expense_date: string | null;
    profiles: { name: string } | null;
  }
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    description: r.description,
    category: r.category,
    amount: r.amount_centavos,
    paidByName: r.profiles?.name ?? "Someone",
    date: r.expense_date,
  }));
}

/* ============================ Activity ============================ */
export interface ActivityRowFull {
  id: string;
  actorName: string;
  text: string;
  kind: string;
  when: string;
}

export async function getTripActivity(tripId: string): Promise<ActivityRowFull[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("id, action, metadata, created_at, profiles:actor_user_id(name)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false })
    .limit(100);

  interface Row {
    id: string;
    action: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
    profiles: { name: string } | null;
  }
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    actorName: r.profiles?.name ?? "Someone",
    text: (r.metadata?.text as string) ?? r.action,
    kind: (r.metadata?.kind as string) ?? "budget",
    when: timeAgo(r.created_at),
  }));
}

/* ============================ Trip settings ============================ */
export async function getTripSettings(tripId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select(
      "id, name, description, destination, start_date, end_date, funding_deadline, status, target_centavos, contribution_mode, cover_image_url, cover_seed",
    )
    .eq("id", tripId)
    .maybeSingle();
  return data;
}
