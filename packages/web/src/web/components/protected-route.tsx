import { Redirect } from "wouter";
import { useSession } from "../hooks/use-session";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "CLIENT" | "ADMIN";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Redirect to="/sign-in" />;

  const userRole = session.user.role;

  if (role && userRole !== role) {
    if (userRole === "ADMIN") return <Redirect to="/admin" />;
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
