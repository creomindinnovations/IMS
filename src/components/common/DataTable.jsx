function cellContent(col, row) {
  if (col.render) return col.render(row);
  const value = row[col.key];
  return value === undefined || value === null || value === '' ? '—' : value;
}

function columnLabel(col) {
  if (col.label) return col.label;
  return col.mobileLabel || 'Actions';
}

export default function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'No records found.' }) {
  if (!rows?.length) {
    return <p className="py-8 text-center text-slate-500">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div
            key={row[rowKey] || row.id || row.uid || i}
            className="rounded-card border border-border bg-white p-4 shadow-sm"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0"
              >
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {columnLabel(col)}
                </span>
                <span className="min-w-0 text-right font-medium text-slate-800">{cellContent(col, row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-border md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row[rowKey] || row.id || row.uid || i}
                className="border-b border-border last:border-0 hover:bg-slate-50/80"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-top">
                    {cellContent(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
