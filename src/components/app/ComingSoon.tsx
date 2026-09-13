import { Wrench } from "@phosphor-icons/react/dist/ssr";

export function ComingSoon({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
        <Wrench size={26} weight="duotone" />
      </span>
      <h2 className="mt-5 text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
        {body}
      </p>
    </div>
  );
}
