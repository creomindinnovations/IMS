export default function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'No records found.' }) {
  if (!rows?.length) {
    return <p className="py-8 text-center text-slate-500">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium text-slate-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[rowKey] || row.id || row.uid || i} className="border-b border-border last:border-0 hover:bg-slate-50/80">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
