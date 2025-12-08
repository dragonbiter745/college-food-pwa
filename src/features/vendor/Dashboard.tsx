import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type OrderItem = {
  item_name_snapshot: string;
  qty: number;
};

type Order = {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const shopId = localStorage.getItem("shop_id");
  const alertSound = new Audio("/sounds/message-ringtone-magic.ogg");

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        status,
        created_at,
        order_items (
          item_name_snapshot,
          qty
        )
      `)
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  }

  useEffect(() => {
  const init = () => {
    loadOrders();
  };
  init();

  const channel = supabase
    .channel("orders-realtime")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      () => {
        if (document.visibilityState === "visible"){
        alertSound.play().catch(() => {});
        }
        loadOrders();
      }
    )
    .on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders" },
      () => loadOrders()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);


  async function updateStatus(id: string) {
    await supabase
      .from("orders")
      .update({ status: "READY" })
      .eq("id", id);

    loadOrders();
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🍽️ Vendor Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-600">No orders yet...</p>
      )}

      {orders.map((o) => (
        <div key={o.id} className="p-4 bg-white shadow rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">{o.customer_name}</h2>
            <span
              className={`text-sm font-semibold ${
                o.status === "READY" ? "text-green-600" : "text-orange-500"
              }`}
            >
              {o.status}
            </span>
          </div>

          <ul className="text-sm text-gray-700 mb-3">
            {o.order_items?.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.item_name_snapshot}</span>
                <span>× {item.qty}</span>
              </li>
            ))}
          </ul>

          {o.status === "QUEUED" && (
            <button
              onClick={() => updateStatus(o.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Mark Ready ✔️
            </button>
          )}

          {o.status === "READY" && (
            <div className="text-center text-green-700 font-bold text-lg">
              Ready for Pickup 🚀
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
