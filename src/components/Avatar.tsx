function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  color,
  size = 32,
  rounded = "rounded-[12px]",
}: {
  name: string;
  color: string;
  size?: number;
  rounded?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 font-heading font-bold text-white ${rounded}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </div>
  );
}
