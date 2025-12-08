import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const signInGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/menu" },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <button
        onClick={signInGoogle}
        className="bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold"
      >
        Continue with Google 🚀
      </button>
    </div>
  );
}
