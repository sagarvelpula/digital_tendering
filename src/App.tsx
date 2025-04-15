
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TenderProvider } from "./context/TenderContext";
import RoleBasedAccess from "./components/auth/RoleBasedAccess";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import TendersList from "./pages/TendersList";
import TenderDetail from "./pages/TenderDetail";
import CreateTender from "./pages/CreateTender";
import PlaceBid from "./pages/PlaceBid";
import MyBids from "./pages/MyBids";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Profile from "./pages/Profile";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TenderProvider>
            <TooltipProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/index" element={<Index />} />
                <Route path="/" element={<Navigate to="/index" />} />
                
                {/* Protected Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tenders" element={<TendersList />} />
                  <Route path="/tenders/:id" element={<TenderDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  
                  {/* Admin only routes */}
                  <Route path="/tenders/new" element={
                    <RoleBasedAccess allowedRoles={["admin"]}>
                      <CreateTender />
                    </RoleBasedAccess>
                  } />
                  
                  <Route path="/vendors" element={
                    <RoleBasedAccess allowedRoles={["admin"]}>
                      <Vendors />
                    </RoleBasedAccess>
                  } />
                  
                  <Route path="/reports" element={
                    <RoleBasedAccess allowedRoles={["admin"]}>
                      <Reports />
                    </RoleBasedAccess>
                  } />
                  
                  {/* Vendor only routes */}
                  <Route path="/tenders/:id/bid" element={
                    <RoleBasedAccess allowedRoles={["vendor"]}>
                      <PlaceBid />
                    </RoleBasedAccess>
                  } />
                  
                  <Route path="/my-bids" element={
                    <RoleBasedAccess allowedRoles={["vendor"]}>
                      <MyBids />
                    </RoleBasedAccess>
                  } />
                </Route>

                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </TenderProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
