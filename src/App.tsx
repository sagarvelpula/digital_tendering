
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TenderProvider } from "./context/TenderContext";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TendersList from "./pages/TendersList";
import TenderDetail from "./pages/TenderDetail";
import CreateTender from "./pages/CreateTender";
import PlaceBid from "./pages/PlaceBid";
import MyBids from "./pages/MyBids";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TenderProvider>
            <TooltipProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/index" element={<Index />} />
                
                {/* Protected Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tenders" element={<TendersList />} />
                  <Route path="/tenders/:id" element={<TenderDetail />} />
                  <Route path="/tenders/new" element={<CreateTender />} />
                  <Route path="/tenders/:id/bid" element={<PlaceBid />} />
                  <Route path="/my-bids" element={<MyBids />} />
                  
                  {/* Additional routes (placeholders) */}
                  <Route path="/vendors" element={<div className="py-20 text-center">Vendors Management (Coming Soon)</div>} />
                  <Route path="/reports" element={<div className="py-20 text-center">Reports Dashboard (Coming Soon)</div>} />
                  <Route path="/settings" element={<div className="py-20 text-center">Settings Page (Coming Soon)</div>} />
                  <Route path="/help" element={<div className="py-20 text-center">Help Center (Coming Soon)</div>} />
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
