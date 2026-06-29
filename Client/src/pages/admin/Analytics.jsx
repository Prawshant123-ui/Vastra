import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { analyticsApi } from "../../api/endpoints.js";
import Loader from "../../components/Loader.jsx";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { analyticsApi.get().then((r) => setData(r.data.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader full />;
  if (!data) return null;

  const top = data.topProducts || [];
  const barData = {
    labels: top.map((p) => p.productName),
    datasets: [{ label: "Units sold", data: top.map((p) => p.totalSold), backgroundColor: "#E8631A", borderRadius: 8 }],
  };

  const status = data.ordersByStatus || {};
  const pie = {
    labels: Object.keys(status),
    datasets: [{ data: Object.values(status), backgroundColor: ["#F5A623", "#E8631A", "#7A4A2A", "#C49A7A", "#3D1F0A", "#FDECD5", "#F0D8C0"] }],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <h3 className="text-lg mb-4">Top selling products</h3>
          <div className="h-72"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>
        <div className="card-base p-6">
          <h3 className="text-lg mb-4">Order status distribution</h3>
          <div className="h-72"><Pie data={pie} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} /></div>
        </div>
      </div>
      <div className="card-base p-6">
        <h3 className="text-lg mb-4">Revenue contribution</h3>
        <div className="divide-y divide-border">
          {top.map((p) => (
            <div key={p.productId} className="py-3 flex items-center justify-between">
              <p className="text-sm text-dark">{p.productName}</p>
              <p className="font-display text-dark">${Number(p.totalRevenue).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
