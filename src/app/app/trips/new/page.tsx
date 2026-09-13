import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { CreateTripForm } from "./CreateTripForm";

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-6 sm:px-8 sm:py-10">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text"
      >
        <ArrowLeft size={16} weight="bold" />
        Back
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Create a trip
      </h1>
      <p className="mt-1.5 text-[15px] text-text-secondary">
        Start with the basics. You can add the itinerary, budget, and members
        next.
      </p>
      <CreateTripForm />
    </div>
  );
}
