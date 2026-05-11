export function ProgressRow({
  hour,
  value,
  width,
}: {
  hour: string;
  value: number;
  width: number;
}) {
  return (
    <div className="mz-bar-row">
      <span>{hour}</span>
      <div className="mz-bar">
        <i style={{ width: `${width}%` }} />
      </div>
      <b>{value}</b>
    </div>
  );
}
