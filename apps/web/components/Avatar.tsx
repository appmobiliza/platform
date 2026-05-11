export function Avatar({
  initials,
  tone = "cyan",
  small = false,
}: {
  initials: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <span className={`mz-avatar mz-avatar-${tone} ${small ? "mz-avatar-sm" : ""}`}>
      {initials}
    </span>
  );
}
