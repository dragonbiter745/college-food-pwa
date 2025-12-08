import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function VendorLogin() {
  const [shopId, setShopId] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("id", shopId)
      .eq("pin_code", pin)
      .single();

    if (error || !data) {
      alert("Invalid Shop ID or PIN");
      return;
    }

    localStorage.setItem("shop_id", shopId);
    navigate("/vendor");
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-8">Vendor Login</h1>

      <input
        placeholder="Shop ID"
        className="border p-3 rounded w-full max-w-xs mb-3"
        value={shopId}
        onChange={(e) => setShopId(e.target.value)}
      />

      <input
        placeholder="PIN"
        type="password"
        className="border p-3 rounded w-full max-w-xs mb-6"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-6 py-3 w-full max-w-xs rounded-lg"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
