import { supabase } from "../../lib/supabase";

export default function StudentLogin() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🍔 College Takeaway</h1>

      <button
        onClick={loginWithGoogle}
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold shadow-md"
      >
        Sign in with Google 🚀
      </button>

      <p className="text-xs opacity-50 mt-6">
        Only students sign in here!
      </p>
    </div>
  );
}
