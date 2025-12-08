import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

type Order = {
  id: string;
  status: string;
};

export default function TrackOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const orderId = localStorage.getItem("active_order_id");
  const alertSound = new Audio("/sounds/message-ringtone-magic.ogg");
  alertSound.volume = 0.8;

  const fetchOrder = async () => {
    if (!orderId) return;
    const { data } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();
    setOrder(data);
  };

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    fetchOrder();

    const channel = supabase
      .channel("order-status")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          const updated = payload.new as Order;
          setOrder(updated);

          if (
            updated.status === "READY" &&
            document.visibilityState === "visible"
          ) {
            alertSound.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen text-white bg-black">
        Loading order...
      </div>
    );
  }

  const isReady = order.status === "READY";

  return (
    <div className="flex flex-col justify-center items-center text-center h-screen bg-black text-white p-5">
      <h1 className="text-3xl font-bold mb-4">
        {isReady ? "ORDER READY" : "ORDER QUEUED"}
      </h1>

      <div className={`w-48 h-48 rounded-full flex items-center justify-center text-3xl font-bold 
        ${isReady ? "bg-green-500 animate-pulse" : "bg-orange-500 animate-spin-slow"}`}>
        {isReady ? "🚀" : "⚡"}
      </div>

      <p className="mt-6 text-lg opacity-80">
        {isReady
          ? "Pick up your food from Roll Me! 🍽️"
          : "Chef is powering up your roll… ⚔️🔥"}
      </p>

      {isReady && (
        <button
          className="mt-6 bg-green-600 px-6 py-3 rounded-lg font-bold"
          onClick={() => {
            localStorage.removeItem("active_order_id");
            navigate("/");
          }}
        >
          Got it! 💪
        </button>
      )}
    </div>
  );
}
