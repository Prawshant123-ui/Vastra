import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { orderApi, paymentApi } from "../api/endpoints.js";
import Loader from "../components/Loader.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = () => {
    setLoading(true);
    orderApi.byId(id).then((r) => setOrder(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const cancel = async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      await orderApi.cancel(id);
      toast.success("Order cancelled");
      load();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to cancel"); }
  };

  const pay = async () => {
    setPaying(true);
    try {
      const { data } = await paymentApi.initiate(Number(id));
      const url = data?.data?.payment_url || data?.payment_url;
      if (url) window.location.href = url;
      else toast.error("Could not start payment");
    } catch (e) { toast.error(e?.response?.data?.message || "Payment failed"); }
    finally { setPaying(false); }
  };

  if (loading) return <Loader full />;
  if (!order) return <div className="max-w-3xl mx-auto py-20 text-center">Order not found.</div>;

  const addr = order.shippingAddress || {};
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const canPay = order.payment?.status !== "PAID" && order.status !== "CANCELLED";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <Breadcrumb items={[{ to: "/", label: "Home" }, { to: "/orders", label: "Orders" }, { label: order.orderNumber }]} />
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card-base p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-muted">Order</p>
                <h1 className="text-2xl">{order.orderNumber}</h1>
                <p className="text-xs text-muted mt-1">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="chip">{order.status}</span>
            </div>
          </div>

          <div className="card-base p-6">
            <h3 className="text-lg mb-4">Items</h3>
            <div className="space-y-3">
              {order.items?.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-section overflow-hidden">
                    {it.product?.images?.[0]?.imageUrl && <img src={it.product.images[0].imageUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark">{it.productName}</p>
                    <p className="text-xs text-muted">Qty {it.quantity} × ${Number(it.price).toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-dark">${Number(it.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-base p-6">
            <h3 className="text-lg mb-2">Shipping address</h3>
            <p className="text-sm text-body">
              {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
            </p>
            {order.notes && <p className="text-sm text-muted mt-3">Notes: {order.notes}</p>}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card-base p-6">
            <Row label="Subtotal" value={`$${Number(order.subtotal).toFixed(2)}`} />
            <Row label="Shipping" value={`$${Number(order.shippingFee).toFixed(2)}`} />
            <Row label="Discount" value={`-$${Number(order.discount).toFixed(2)}`} />
            <div className="h-px bg-border my-3" />
            <Row label="Total" value={`$${Number(order.total).toFixed(2)}`} bold />
            <p className="text-xs text-muted mt-3">
              Payment: {order.payment?.status || "PENDING"} ({order.payment?.method || "—"})
            </p>
          </div>
          {canPay && <button onClick={pay} disabled={paying} className="btn-primary w-full">{paying ? "Starting…" : "Pay now"}</button>}
          {canCancel && <button onClick={cancel} className="btn-outline w-full">Cancel order</button>}
          <Link to="/orders" className="btn-ghost w-full text-center block">Back to orders</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-body">{label}</span>
      <span className={bold ? "text-lg font-display text-dark" : "text-sm font-medium text-dark"}>{value}</span>
    </div>
  );
}
