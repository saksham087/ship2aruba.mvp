import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { ProtectedRoute } from "./components/protected-route";
import { AgentFeedback } from "@runablehq/website-runtime";

// Public pages
import IndexPage from "./pages/index";
import SignInPage from "./pages/sign-in";
import SignUpPage from "./pages/sign-up";

// Client pages (self-wrap in DashboardLayout)
import ClientDashboard from "./pages/client/dashboard";
import ClientPackages from "./pages/client/packages";
import ClientPackageDetail from "./pages/client/package-detail";
import ClientUploadPackage from "./pages/client/upload-package";
import ClientNotifications from "./pages/client/notifications";

// Admin pages (self-wrap in DashboardLayout where needed)
import AdminDashboard from "./pages/admin/dashboard";
import AdminPendingReviews from "./pages/admin/pending-reviews";
import AdminAllPackages from "./pages/admin/all-packages";
import AdminPackageDetail from "./pages/admin/package-detail";
import AdminShipmentRequests from "./pages/admin/shipment-requests";
import AdminClients from "./pages/admin/clients";
import { DashboardLayout } from "./components/layout";

function App() {
  return (
    <Provider>
      <Switch>
        {/* Public */}
        <Route path="/" component={IndexPage} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />

        {/* Client routes — pages include DashboardLayout internally */}
        <Route path="/dashboard">
          <ProtectedRoute role="CLIENT">
            <ClientDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/packages">
          <ProtectedRoute role="CLIENT">
            <ClientPackages />
          </ProtectedRoute>
        </Route>

        <Route path="/packages/new">
          <ProtectedRoute role="CLIENT">
            <ClientUploadPackage />
          </ProtectedRoute>
        </Route>

        <Route path="/upload-package">
          <ProtectedRoute role="CLIENT">
            <ClientUploadPackage />
          </ProtectedRoute>
        </Route>

        <Route path="/packages/:id">
          {() => (
            <ProtectedRoute role="CLIENT">
              <ClientPackageDetail />
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/notifications">
          <ProtectedRoute role="CLIENT">
            <ClientNotifications />
          </ProtectedRoute>
        </Route>

        {/* Admin routes — dashboards self-wrap, detail pages need layout */}
        <Route path="/admin">
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/pending">
          <ProtectedRoute role="ADMIN">
            <AdminPendingReviews />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/packages">
          <ProtectedRoute role="ADMIN">
            <AdminAllPackages />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/packages/:id">
          {() => (
            <ProtectedRoute role="ADMIN">
              <DashboardLayout>
                <AdminPackageDetail />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/admin/shipments">
          <ProtectedRoute role="ADMIN">
            <DashboardLayout>
              <AdminShipmentRequests />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/clients">
          <ProtectedRoute role="ADMIN">
            <DashboardLayout>
              <AdminClients />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>

        {/* 404 */}
        <Route>
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-gray-500">Page not found</p>
            <a href="/" className="text-blue-600 hover:underline">Go home</a>
          </div>
        </Route>
      </Switch>

      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
