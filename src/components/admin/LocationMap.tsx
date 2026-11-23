/**
 * OpenStreetMap embed centred on a point. Rendered only in the admin, so the
 * coordinates are sent to openstreetmap.org from the admin's browser alone.
 */
export function LocationMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  // ~10 km box around the point: enough context for a city-level estimate.
  const pad = 0.08;
  const bbox = [longitude - pad, latitude - pad, longitude + pad, latitude + pad]
    .map((n) => n.toFixed(4))
    .join(",");
  const marker = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  const full = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=11/${latitude}/${longitude}`;

  return (
    <figure className="space-y-2">
      <iframe
        title={label}
        src={embed}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-72 w-full rounded-xl border border-ink/10 bg-ink/5 sm:h-96"
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span>{label}</span>
        <a
          href={full}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-sm text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-accent"
        >
          Open larger map ↗
        </a>
      </figcaption>
    </figure>
  );
}
