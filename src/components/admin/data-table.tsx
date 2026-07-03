import { cn } from "@/lib/utils";

interface Column<Row> {
  key: keyof Row | string;
  header: string;
  render?: (row: Row) => React.ReactNode;
  className?: string;
}

/** Lightweight, responsive table for admin lists. */
export function DataTable<Row extends { id: string }>({
  columns,
  rows,
}: {
  columns: Column<Row>[];
  rows: Row[];
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-faint">
              {columns.map((c) => (
                <th key={String(c.key)} className={cn("px-4 py-3 font-medium", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-2/50"
              >
                {columns.map((c) => (
                  <td key={String(c.key)} className={cn("px-4 py-3", c.className)}>
                    {c.render ? c.render(row) : String(row[c.key as keyof Row] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
