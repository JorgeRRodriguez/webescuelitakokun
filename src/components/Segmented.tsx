"use client";

import clsx from "clsx";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-track rounded-pill p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "flex-1 rounded-pill py-1.5 text-xs font-extrabold transition-colors",
            value === o.value ? "bg-white text-magenta shadow-sm" : "text-texto-3"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
