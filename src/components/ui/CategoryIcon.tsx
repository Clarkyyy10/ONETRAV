import {
  Car,
  ForkKnife,
  House,
  Ticket,
  Confetti,
  Coffee,
  ShoppingBag,
  Bed,
  Airplane,
  Mountains,
  Tag,
} from "@phosphor-icons/react/dist/ssr";

/** Render a sensible icon for a free-form category label (keyword matched). */
export function CategoryIcon({
  category,
  size = 20,
}: {
  category: string;
  size?: number;
}) {
  const c = category.toLowerCase();
  const p = { size, weight: "duotone" as const };

  if (/(air|flight|plane|ferry|boat)/.test(c)) return <Airplane {...p} />;
  if (/(transport|travel|car|gas|bus|taxi|fuel|toll|drive)/.test(c)) return <Car {...p} />;
  if (/(accommod|hotel|resort|airbnb|villa|stay|lodg)/.test(c)) return <Bed {...p} />;
  if (/(check-?in|room)/.test(c)) return <House {...p} />;
  if (/(snack|coffee|drink|cafe)/.test(c)) return <Coffee {...p} />;
  if (/(food|breakfast|lunch|dinner|meal|eat|restaurant)/.test(c)) return <ForkKnife {...p} />;
  if (/(entrance|ticket|fee|pass)/.test(c)) return <Ticket {...p} />;
  if (/(activity|activities|tour|experience|island|adventure)/.test(c)) return <Confetti {...p} />;
  if (/(beach|mountain|nature|park|hike|outdoor)/.test(c)) return <Mountains {...p} />;
  if (/(shop|market|souvenir)/.test(c)) return <ShoppingBag {...p} />;
  return <Tag {...p} />;
}
