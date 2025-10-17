import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SchuldErfassen from "./pages/SchuldErfassen";
import ForderungErfassen from "./pages/ForderungErfassen";
import ZahlungMelden from "./pages/ZahlungMelden";
import Optimierung from "./pages/Optimierung";
import Pool from "./pages/Pool";
import ImportExport from "./pages/ImportExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schuld-erfassen" element={<SchuldErfassen />} />
          <Route path="/forderung-erfassen" element={<ForderungErfassen />} />
          <Route path="/zahlung-melden" element={<ZahlungMelden />} />
          <Route path="/optimierung" element={<Optimierung />} />
          <Route path="/pool" element={<Pool />} />
          <Route path="/import-export" element={<ImportExport />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
