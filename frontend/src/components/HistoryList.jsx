export default function HistoryList({ items }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-inkfaint">
        No readings yet. Your last submissions on this server will show up here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-inkfaint uppercase text-xs tracking-wide border-b rule">
            <th className="py-2 pr-4 font-normal">Time</th>
            <th className="py-2 pr-4 font-normal">Age</th>
            <th className="py-2 pr-4 font-normal">Sex</th>
            <th className="py-2 pr-4 font-normal">Result</th>
            <th className="py-2 pr-4 font-normal">Confidence</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {items.map((row) => (
            <tr key={row.id} className="border-b rule last:border-0">
              <td className="py-2 pr-4 text-inkfaint">
                {new Date(row.created_at).toLocaleString()}
              </td>
              <td className="py-2 pr-4">{row.age}</td>
              <td className="py-2 pr-4">{row.sex === 1 ? "M" : "F"}</td>
              <td className={`py-2 pr-4 ${row.prediction === 1 ? "text-alert" : "text-teal-dark"}`}>
                {row.prediction === 1 ? "At risk" : "Low risk"}
              </td>
              <td className="py-2 pr-4">{(row.confidence * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
