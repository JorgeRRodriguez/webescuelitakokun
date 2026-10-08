import clsx from "clsx";

const LETTER_COLORS = ["#1E92B5", "#F28C28", "#B3166F", "#5E9E1F", "#7B4BA8"];

export function KokunLogo({ withTagline = true, className }: { withTagline?: boolean; className?: string }) {
  return (
    <div className={clsx("flex flex-col leading-none select-none", className)}>
      <span className="font-heading font-bold text-2xl tracking-tight flex items-center gap-[1px]">
        {"KOKUN".split("").map((letter, i) => (
          <span key={i} style={{ color: LETTER_COLORS[i % LETTER_COLORS.length] }}>
            {letter}
          </span>
        ))}
        <span aria-hidden className="ml-0.5">
          🦋
        </span>
      </span>
      {withTagline && (
        <span className="text-[10px] font-extrabold tracking-[0.08em] text-texto-3 uppercase">
          Daycare &amp; Preschool
        </span>
      )}
    </div>
  );
}
