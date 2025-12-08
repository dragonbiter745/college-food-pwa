import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type HistoryOrder = {
  id: string;
  status: string;
  created_at: string;
  order_items: {
    item_name_snapshot: string;
    qty: number;
  }[];
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        created_at,
        order_items (
          item_name_snapshot,
          qty
        )
      `)
      .eq("shop_id", "roll-me")
      .in("status", ["READY", "COMPLETED"])
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-5">📜 Order History</h1>

      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && (
        <p className="opacity-60">No previous orders yet 🙃</p>
      )}

      {orders.map((o) => (
        <div
          key={o.id}
          className="bg-gray-800 p-4 rounded-xl mb-4 shadow-md space-y-2"
        >
          <div className="flex justify-between">
            <span className="font-semibold">{o.status}</span>
            <span className="text-sm opacity-70">
              {new Date(o.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <ul className="text-sm gap-1">
            {o.order_items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.item_name_snapshot}</span>
                <span>× {item.qty}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
