/**
 * Mock data for the frontend prototype. All amounts are in centavos.
 * Names are locale-appropriate (Filipino friend group), not "John Doe".
 */

export type TripStatus =
  | "Planning"
  | "Funding"
  | "Ready"
  | "Ongoing"
  | "Completed"
  | "Cancelled";

// Categories are free-form/customizable, so this is just a display string.
export type BudgetCategory = string;

export interface Member {
  id: string;
  name: string;
  initials: string;
  target: number;
  paid: number;
}

export interface BudgetLine {
  id: string;
  category: BudgetCategory;
  name: string;
  estimated: number;
  actual: number | null;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  category: BudgetCategory;
  amount: number;
}

export interface ItineraryDay {
  id: string;
  label: string;
  date: string;
  items: ItineraryItem[];
}

export interface ActivityEntry {
  id: string;
  kind: "contribution" | "verified" | "budget" | "expense" | "member";
  text: string;
  when: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  dateRange: string;
  status: TripStatus;
  coverSeed: string;
  coverImageUrl?: string | null;
  target: number;
  raised: number;
  spent: number;
  members: Member[];
  budget: BudgetLine[];
  itinerary: ItineraryDay[];
  activity: ActivityEntry[];
}

export const trips: Trip[] = [
  {
    id: "batangas-staycation",
    name: "Batangas Staycation",
    destination: "Laiya, Batangas",
    dateRange: "Jun 20-22",
    status: "Funding",
    coverSeed: "batangas-beach-resort-philippines",
    target: 3060000,
    raised: 1850000,
    spent: 1200000,
    members: [
      { id: "m1", name: "Clark", initials: "CL", target: 510000, paid: 510000 },
      { id: "m2", name: "Gab", initials: "GB", target: 510000, paid: 510000 },
      { id: "m3", name: "Amara", initials: "AM", target: 510000, paid: 300000 },
      { id: "m4", name: "Mig", initials: "MG", target: 510000, paid: 280000 },
      { id: "m5", name: "Ysa", initials: "YS", target: 510000, paid: 250000 },
      { id: "m6", name: "Reign", initials: "RG", target: 510000, paid: 0 },
    ],
    budget: [
      { id: "b1", category: "Accommodation", name: "Beachfront villa (2 nights)", estimated: 1200000, actual: 1200000 },
      { id: "b2", category: "Transportation", name: "Van rental + fuel + toll", estimated: 380000, actual: null },
      { id: "b3", category: "Food", name: "Groceries + 4 shared meals", estimated: 980000, actual: null },
      { id: "b4", category: "Activity", name: "Island hopping (6 pax)", estimated: 240000, actual: null },
      { id: "b5", category: "Entrance", name: "Resort day pass", estimated: 210000, actual: null },
      { id: "b6", category: "Other", name: "First-aid + contingency", estimated: 50000, actual: null },
    ],
    itinerary: [
      {
        id: "d1",
        label: "Day 1",
        date: "June 20",
        items: [
          { id: "i1", time: "07:00", title: "Travel to Laiya", detail: "Van pickup, fuel and toll", category: "Transportation", amount: 230000 },
          { id: "i2", time: "12:00", title: "Lunch stop", detail: "Roadside lomi + silog", category: "Food", amount: 180000 },
          { id: "i3", time: "14:00", title: "Villa check-in", detail: "Beachfront villa, 2 nights", category: "Accommodation", amount: 1200000 },
          { id: "i4", time: "18:30", title: "Welcome dinner", detail: "Grilled seafood, cooked in", category: "Food", amount: 320000 },
        ],
      },
      {
        id: "d2",
        label: "Day 2",
        date: "June 21",
        items: [
          { id: "i5", time: "09:00", title: "Island hopping", detail: "6 pax, includes boat + guide", category: "Activity", amount: 240000 },
          { id: "i6", time: "13:00", title: "Beach picnic", detail: "Groceries prepared ahead", category: "Food", amount: 260000 },
          { id: "i7", time: "20:00", title: "Bonfire night", detail: "Firewood + marshmallows", category: "Other", amount: 50000 },
        ],
      },
      {
        id: "d3",
        label: "Day 3",
        date: "June 22",
        items: [
          { id: "i8", time: "10:00", title: "Check-out + brunch", detail: "Last shared meal", category: "Food", amount: 220000 },
          { id: "i9", time: "13:00", title: "Drive home", detail: "Fuel + toll (return)", category: "Transportation", amount: 150000 },
        ],
      },
    ],
    activity: [
      { id: "a1", kind: "contribution", text: "Clark contributed ₱5,100", when: "2h ago" },
      { id: "a2", kind: "verified", text: "Gab's contribution was verified", when: "5h ago" },
      { id: "a3", kind: "budget", text: "Food budget changed ₱8,600 → ₱9,800", when: "Yesterday" },
      { id: "a4", kind: "member", text: "Reign joined the trip", when: "2 days ago" },
    ],
  },
  {
    id: "baguio-weekend",
    name: "Baguio Weekend",
    destination: "Baguio City",
    dateRange: "Aug 8-10",
    status: "Planning",
    coverSeed: "baguio-pine-mountains-philippines",
    target: 0,
    raised: 0,
    spent: 0,
    members: [
      { id: "m1", name: "Clark", initials: "CL", target: 0, paid: 0 },
      { id: "m2", name: "Ysa", initials: "YS", target: 0, paid: 0 },
      { id: "m3", name: "Mig", initials: "MG", target: 0, paid: 0 },
    ],
    budget: [],
    itinerary: [],
    activity: [{ id: "a1", kind: "member", text: "Clark created the trip", when: "3 days ago" }],
  },
];

export function getTrip(id: string): Trip | undefined {
  return trips.find((t) => t.id === id);
}

export const currentUser = { name: "Clark", initials: "CL" };
