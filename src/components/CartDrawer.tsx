import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, total, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // 🔐 Check login
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to continue!");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, 
        },
      });
      return;
    }

    const orderId = uuidv4();

    // 1️⃣ Insert into orders table
    const { error: orderError } = await supabase.from("orders").insert([
      {
        id: orderId,
        shop_id: "roll-me",
        customer_name: user.email || "Unknown",
        status: "QUEUED",
      },
    ]);

    if (orderError) {
      alert("❌ Failed to create order");
      console.error(orderError);
      return;
    }

    // 2️⃣ Insert items
    const itemsToInsert = cart.map((item) => ({
      order_id: orderId,
      item_id: item.id,
      qty: item.qty,
      item_name_snapshot: item.item_name,
      price_snapshot: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      alert("❌ Failed to submit items");
      console.error(itemsError);
      return;
    }

    clearCart();
    localStorage.setItem("active_order_id", orderId);
    navigate("/track");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-2xl
      transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold">Your Order</h2>
        <button className="text-gray-500" onClick={onClose}>✕</button>
      </div>

      <div className="p-4 max-h-72 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-3">
            <span>{item.item_name} × {item.qty}</span>
            <div className="flex items-center gap-3">
              <span>₹{item.price * item.qty}</span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between font-bold text-lg mb-3">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Proceed to Checkout 🚀
        </button>
      </div>
    </div>
  );
}
