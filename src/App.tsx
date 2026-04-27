import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";

const Catalogo = lazy(() => import("./pages/Catalogo.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminLayout = lazy(() => import("./admin/AdminLayout.tsx"));
const AdminLogin = lazy(() => import("./admin/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("./admin/AdminProducts.tsx"));
const AdminAuditLog = lazy(() => import("./admin/AdminAuditLog.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="audit" element={<AdminAuditLog />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
