import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Public pages
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";

// Patient pages
import PatientDashboard from "./pages/patient/Dashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientMedicalRecords from "./pages/patient/MedicalRecords";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientProfile from "./pages/patient/Profile";
import TelehealthConsultation from "./pages/patient/TelehealthConsultation";

// Doctor pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorPatientQueue from "./pages/doctor/PatientQueue";
import DoctorConsultations from "./pages/doctor/Consultations";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";

// Pharmacy pages
import PharmacyDashboard from "./pages/pharmacy/Dashboard";
import PharmacyInventory from "./pages/pharmacy/Inventory";
import PharmacyPrescriptions from "./pages/pharmacy/Prescriptions";

// Emergency pages
import EmergencyDispatch from "./pages/emergency/Dispatch";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAnalytics from "./pages/admin/Analytics";

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  roles?: string[];
  path: string;
}

function ProtectedRoute({ component: Component, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return <NotFound />;
  }

  if (roles && !roles.includes(user.role)) {
    return <NotFound />;
  }

  return <Component />;
}

// ============================================================================
// ROUTER COMPONENT
// ============================================================================

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />

      {/* Patient Routes */}
      {user?.role === "patient" && (
        <>
          <Route path="/patient/dashboard">
            {() => (
              <DashboardLayout>
                <PatientDashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/patient/appointments">
            {() => (
              <DashboardLayout>
                <PatientAppointments />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/patient/medical-records">
            {() => (
              <DashboardLayout>
                <PatientMedicalRecords />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/patient/prescriptions">
            {() => (
              <DashboardLayout>
                <PatientPrescriptions />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/patient/profile">
            {() => (
              <DashboardLayout>
                <PatientProfile />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/patient/telehealth/:appointmentId">
            {() => (
              <DashboardLayout>
                <TelehealthConsultation />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}

      {/* Doctor Routes */}
      {user?.role === "doctor" && (
        <>
          <Route path="/doctor/dashboard">
            {() => (
              <DashboardLayout>
                <DoctorDashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/doctor/patient-queue">
            {() => (
              <DashboardLayout>
                <DoctorPatientQueue />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/doctor/consultations">
            {() => (
              <DashboardLayout>
                <DoctorConsultations />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/doctor/prescriptions">
            {() => (
              <DashboardLayout>
                <DoctorPrescriptions />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}

      {/* Pharmacy Routes */}
      {user?.role === "pharmacy" && (
        <>
          <Route path="/pharmacy/dashboard">
            {() => (
              <DashboardLayout>
                <PharmacyDashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/pharmacy/inventory">
            {() => (
              <DashboardLayout>
                <PharmacyInventory />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/pharmacy/prescriptions">
            {() => (
              <DashboardLayout>
                <PharmacyPrescriptions />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}

      {/* Emergency Routes */}
      {user?.role === "emergency_responder" && (
        <>
          <Route path="/emergency/dispatch">
            {() => (
              <DashboardLayout>
                <EmergencyDispatch />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}

      {/* Admin Routes */}
      {user?.role === "admin" && (
        <>
          <Route path="/admin/dashboard">
            {() => (
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/admin/users">
            {() => (
              <DashboardLayout>
                <AdminUsers />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/admin/analytics">
            {() => (
              <DashboardLayout>
                <AdminAnalytics />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}

      {/* 404 Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
