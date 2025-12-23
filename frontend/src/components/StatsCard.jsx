export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded p-5">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}
