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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import ProfileSubmissions from "./pages/ProfileSubmissions";
import Terms from "./pages/Terms";
import Unsubscribe from "./pages/Unsubscribe";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import NewsManager from "./pages/admin/NewsManager";
import LinkedInManager from "./pages/admin/LinkedInManager";
import TeamManager from "./pages/admin/TeamManager";
import SolutionsManager from "./pages/admin/SolutionsManager";
import ContentManager from "./pages/admin/ContentManager";
import ContactsManager from "./pages/admin/ContactsManager";
import FAQManager from "./pages/admin/FAQManager";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import { PendingSubmissionHandler } from "./components/home/PendingSubmissionHandler";

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
        <PendingSubmissionHandler />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/solutions/:slug" element={<SolutionDetail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />

          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected user routes */}
          <Route
            path="/profile"
            element={
              <AuthenticatedRoute>
                <Profile />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/profile/submissions"
            element={
              <AuthenticatedRoute>
                <ProfileSubmissions />
              </AuthenticatedRoute>
            }
          />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/news" element={<NewsManager />} />
          <Route path="/admin/linkedin" element={<LinkedInManager />} />
          <Route path="/admin/team" element={<TeamManager />} />
          <Route path="/admin/solutions" element={<SolutionsManager />} />
          <Route path="/admin/content" element={<ContentManager />} />
          <Route path="/admin/contacts" element={<ContactsManager />} />
          <Route path="/admin/faq" element={<FAQManager />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
