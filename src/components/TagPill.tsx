type TagPillProps = {
  label: string;
};

/** Small subtle pill used for the sidebar stack tags. */
export default function TagPill({ label }: TagPillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] leading-none text-secondary">
      {label}
    </span>
  );
}
