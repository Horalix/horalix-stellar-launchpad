import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import SolutionDetail from "./pages/SolutionDetail";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import NewsManager from "./pages/admin/NewsManager";
import TeamManager from "./pages/admin/TeamManager";
import SolutionsManager from "./pages/admin/SolutionsManager";
import ContentManager from "./pages/admin/ContentManager";
import ContactsManager from "./pages/admin/ContactsManager";

const queryClient = new QueryClient();

/**
 * App - Root application component
 * Sets up routing, providers, and global UI elements
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/solutions/:slug" element={<SolutionDetail />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/news" element={<NewsManager />} />
          <Route path="/admin/team" element={<TeamManager />} />
          <Route path="/admin/solutions" element={<SolutionsManager />} />
          <Route path="/admin/content" element={<ContentManager />} />
          <Route path="/admin/contacts" element={<ContactsManager />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
