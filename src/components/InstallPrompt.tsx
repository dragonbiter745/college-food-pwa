import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log("INSTALL_OUTCOME:", outcome);

    setInstallPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 bg-red-600 text-white font-bold 
      px-5 py-3 rounded-full shadow-xl z-50 
      animate-bounce hover:animate-none active:scale-95 transition"
    >
      Install App 📲
    </button>
  );
}
