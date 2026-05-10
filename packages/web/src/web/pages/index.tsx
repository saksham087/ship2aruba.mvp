import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSession } from "../hooks/use-session";
import { Loader2 } from "lucide-react";

export default function IndexPage() {
  const { data: session, isPending } = useSession();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      navigate("/sign-in");
      return;
    }
    const role = session.user.role;
    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }, [session, isPending]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );
}
