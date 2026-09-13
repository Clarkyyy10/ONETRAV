import Image from "next/image";
import {
  MapTrifold,
  Wallet,
  UsersThree,
  ShieldCheck,
  ArrowsLeftRight,
  ChartLineUp,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";

import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Money } from "@/components/ui/Money";
import { Reveal } from "@/components/ui/Reveal";
import { getTrip } from "@/lib/mock";
import { fundingPercent } from "@/lib/money";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <FairSplitting />
        <Testimonial />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — asymmetric split: message left, real UI preview right        */
/* ------------------------------------------------------------------ */
function Hero() {
  const trip = getTrip("batangas-staycation")!;
  const pct = fundingPercent(trip.raised, trip.target);
  const funded = trip.members.filter((m) => m.paid >= m.target && m.target > 0).length;

  return (
    <section className="relative overflow-hidden">
      {/* soft ambient wash, single accent, no AI-purple mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-accent-soft opacity-60 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24">
        <div className="animate-rise">
          <Badge tone="accent">For groups who travel together</Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Save for the trip,
            <br />
            <span className="text-accent">together.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-text-secondary">
            Plan the itinerary, set one shared target, and track every
            contribution and expense in a single calm app.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/app" size="lg" trailingIcon>
              Open the app
            </ButtonLink>
            <ButtonLink href="#how" size="lg" variant="secondary">
              See how it works
            </ButtonLink>
          </div>
        </div>

        {/* Real component preview (not a fake screenshot) */}
        <div className="animate-rise [animation-delay:120ms]">
          <div className="rounded-card bg-surface-2 p-2 ring-1 ring-border shadow-soft-lg">
            <div className="overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-surface">
              <div className="relative h-40 w-full">
                <Image
                  src="https://picsum.photos/seed/laiya-batangas-beach/720/360"
                  alt="Beach cove at Laiya, Batangas"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3">
                  <StatusBadge status={trip.status} />
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-text-muted">{trip.dateRange} · {trip.destination}</p>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight">
                  {trip.name}
                </h2>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <Money centavos={trip.raised} size="lg" />
                    <span className="ml-1 text-sm text-text-muted">
                      of <Money centavos={trip.target} size="sm" muted />
                    </span>
                  </div>
                  <span className="tnum text-sm font-bold text-accent">{pct}%</span>
                </div>

                <ProgressBar value={pct} label="Trip funding progress" className="mt-3" />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {trip.members.slice(0, 5).map((m) => (
                      <span
                        key={m.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-[11px] font-bold text-text-secondary ring-2 ring-surface"
                      >
                        {m.initials}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-text-secondary">
                    {funded} of {trip.members.length} funded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works — editorial split: heading left, stepped rows right    */
/* ------------------------------------------------------------------ */
const steps = [
  {
    verb: "Plan",
    body: "Build a day-by-day itinerary and add the expected cost of every part of the trip.",
    icon: MapTrifold,
  },
  {
    verb: "Save",
    body: "The app sets each person's share of the target, then tracks who has paid.",
    icon: Wallet,
  },
  {
    verb: "Settle",
    body: "Record what was actually spent and see exactly who needs to pay whom.",
    icon: ArrowsLeftRight,
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-surface-2/60 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            One loop, from
            <br />
            planning to payback.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-text-secondary">
            No more scattered spreadsheets, calculators, and group-chat
            reminders. The whole trip lives in one place.
          </p>
        </Reveal>

        <ol className="relative space-y-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.verb} delay={i * 0.08}>
              <div className="flex items-start gap-5 rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.9rem] bg-accent-soft text-accent">
                  <s.icon size={24} weight="duotone" />
                </span>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="tnum text-sm font-bold text-text-muted">
                      0{i + 1}
                    </span>
                    <h3 className="text-lg font-bold tracking-tight">{s.verb}</h3>
                  </div>
                  <p className="mt-1 text-base leading-relaxed text-text-secondary">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features — asymmetric bento grid with mixed tile sizes + tints      */
/* ------------------------------------------------------------------ */
function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <Badge tone="accent">Everything the group needs</Badge>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Connected from the itinerary to the last split bill.
          </h2>
        </Reveal>

        <div className="mt-12 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 md:grid-cols-6">
          {/* Large tinted tile */}
          <Reveal className="md:col-span-4">
            <article className="flex h-full flex-col justify-between overflow-hidden rounded-card bg-accent p-7 text-accent-fg shadow-soft-md">
              <div>
                <ChartLineUp size={30} weight="duotone" />
                <h3 className="mt-4 text-2xl font-bold tracking-tight">
                  Live funding progress
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-accent-fg/85">
                  Watch the group target fill up as verified contributions land.
                  Everyone sees the same honest number.
                </p>
              </div>
              <div className="mt-8 rounded-[1rem] bg-white/12 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Batangas Staycation</span>
                  <span className="tnum">61%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-pill bg-white/25">
                  <div className="h-full w-[61%] rounded-pill bg-white" />
                </div>
              </div>
            </article>
          </Reveal>

          {/* Tall image tile */}
          <Reveal className="md:col-span-2 md:row-span-2" delay={0.05}>
            <article className="relative flex h-full min-h-[240px] flex-col justify-end overflow-hidden rounded-card p-6 text-white shadow-soft-md">
              <Image
                src="https://picsum.photos/seed/philippine-island-hopping/520/720"
                alt="Island-hopping boat on turquoise water"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative">
                <MapTrifold size={26} weight="duotone" />
                <h3 className="mt-3 text-xl font-bold tracking-tight">
                  Timeline itinerary
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-white/85">
                  Each stop carries its own cost, so the plan and the budget
                  never drift apart.
                </p>
              </div>
            </article>
          </Reveal>

          {/* Small tiles */}
          <Reveal className="md:col-span-2" delay={0.1}>
            <FeatureTile
              icon={UsersThree}
              title="Fair shares"
              body="Equal split or custom targets per member, calculated for you."
            />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.15}>
            <FeatureTile
              icon={Receipt}
              title="Real expenses"
              body="Compare what you planned against what you actually spent."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number; weight?: "duotone" }>;
  title: string;
  body: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-[0.8rem] bg-accent-soft text-accent">
        <Icon size={22} weight="duotone" />
      </span>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-1 text-[15px] leading-relaxed text-text-secondary">{body}</p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Fair splitting — 2-col feature with a real settlement preview       */
/* ------------------------------------------------------------------ */
function FairSplitting() {
  const settlements = [
    { from: "Gab", amount: "₱400" },
    { from: "Amara", amount: "₱300" },
    { from: "Mig", amount: "₱500" },
  ];
  return (
    <section id="fair" className="scroll-mt-24 bg-surface-2/60 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Badge tone="accent">Fair by design</Badge>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            No debtor jargon. Just who pays whom.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary">
            When someone covers a shared cost, the app works out the simplest
            way to make everyone even, in plain language.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Separate estimated costs from real spending",
              "Track who paid for each shared expense",
              "See a clear, minimal set of paybacks",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px]">
                <ShieldCheck
                  size={20}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-success"
                />
                <span className="text-text-secondary">{point}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-card bg-surface p-6 ring-1 ring-border shadow-soft-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              Settlement
            </p>
            <p className="mt-3 text-base text-text-secondary">Clark should receive</p>
            <Money centavos={120000} size="xl" className="mt-1 block text-accent" />

            <div className="mt-6 divide-y divide-border rounded-[1rem] bg-surface-2/70">
              {settlements.map((s) => (
                <div
                  key={s.from}
                  className="flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-xs font-bold text-text-secondary ring-1 ring-border">
                      {s.from.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{s.from}</span>
                  </div>
                  <span className="tnum text-sm font-bold">{s.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonial — single quote, realistic attribution                   */
/* ------------------------------------------------------------------ */
function Testimonial() {
  return (
    <section className="py-24">
      <Reveal className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          &ldquo;We stopped chasing each other in the group chat. Everyone just
          opens the app, sees their share, and pays. The Baguio trip funded
          itself two weeks early.&rdquo;
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            YS
          </span>
          <div className="text-left">
            <p className="text-sm font-bold">Ysa Villanueva</p>
            <p className="text-sm text-text-muted">Trip organizer, Manila</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA — centered band                                           */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section className="px-6 pb-24">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-card bg-accent px-8 py-16 text-center text-accent-fg shadow-soft-lg sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <h2 className="relative mx-auto max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Start planning your next trip together.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-base text-accent-fg/85">
            Create a trip, invite the group, and set your target in minutes.
          </p>
          <div className="relative mt-8 flex justify-center">
            <ButtonLink href="/app" size="lg" variant="secondary" trailingIcon>
              Open the app
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
