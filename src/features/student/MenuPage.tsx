import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: string;
  item_name: string;
  price: number;
  category: string;
  is_veg: boolean;
}

export default function MenuPage({ openCart }: { openCart: () => void }) {
  const [grouped, setGrouped] = useState<Record<string, MenuItem[]>>({});
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMenu = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      const groups = (data ?? []).reduce((acc: any, item: MenuItem) => {
        const cat = item.category || "Others";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});

      setGrouped(groups);
    };

    loadMenu();
  }, []);

  return (
    <div className="pb-24 min-h-screen pt-4 bg-gradient-to-b from-[#fff5e9] via-[#fffaf3] to-white">

      {/* Mobile container */}
      <div className="max-w-md mx-auto pt-10 relative">

        {/* 🔹 Order History Button */}
        <button
          onClick={() => navigate("/history")}
          className="fixed top-4 left-4 bg-gray-900 text-white px-3 py-1 rounded-lg shadow-md text-sm"
        >
          📜 History
        </button>

        {/* 🔹 Logout Button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem("active_order_id");
            navigate("/");
          }}
          className="fixed top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg shadow-md text-sm"
        >
          🚪 Logout
        </button>

        {/* Menu */}
        {/* Menu */}
{Object.entries(grouped).map(([category, items]) => (
  <div key={category} className="mb-6">
    <h2 className="text-xl font-extrabold text-gray-900 px-4 mb-2 tracking-tight">

      {category}
    </h2>

    <div className="space-y-4">
      {items.map((item) => (
        <div
  key={item.id}
  className="flex justify-between items-center gap-4 p-4 bg-white rounded-2xl 
  shadow-md mx-4 border border-gray-200 hover:shadow-lg transition active:scale-[0.98]"
>
  {/* Item Name + Veg/NonVeg Dot */}
  <div className="flex-1 flex items-start gap-3 pr-2">
    <span
      className={`w-3 h-3 mt-1 rounded-full ${
        item.is_veg ? "bg-green-600" : "bg-red-600"
      }`}
    ></span>
    <span className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
      {item.item_name}
    </span>
  </div>

  {/* Price + Add Button */}
  <div className="flex flex-col items-end justify-center min-w-[80px]">
    <span className="font-bold text-gray-900 text-sm sm:text-base mb-1 whitespace-nowrap">
      ₹{item.price}
    </span>
    <button
      onClick={() =>
        addToCart({
          id: item.id,
          item_name: item.item_name,
          price: item.price,
          qty: 1,
          is_veg: item.is_veg,
        })
      }
      className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm
      active:scale-95 transition whitespace-nowrap"
    >
      Add +
    </button>
  </div>
</div>

      ))}
    </div>
  </div>
))}


        {/* Floating Cart Button */}
        {/* Floating Cart Button */}
{cart.length > 0 && (
  <button
    onClick={openCart}
    className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-600 
      text-white px-8 py-4 rounded-full shadow-2xl font-extrabold 
      text-lg tracking-wide flex items-center gap-2 active:scale-95"
  >
    🛒 Cart ({cart.reduce((acc, item) => acc + item.qty, 0)})
  </button>
)}

      </div>
    </div>
  );
}
