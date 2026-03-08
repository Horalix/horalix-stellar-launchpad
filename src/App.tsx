import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PendingSubmissionHandler } from "./components/home/PendingSubmissionHandler";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = lazy(() => import("./pages/Index"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const Solutions = lazy(() => import("./pages/Solutions"));
const SolutionDetail = lazy(() => import("./pages/SolutionDetail"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const About = lazy(() => import("./pages/About"));
const TeamProfile = lazy(() => import("./pages/TeamProfile"));
const Evidence = lazy(() => import("./pages/Evidence"));
const Terms = lazy(() => import("./pages/Terms"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileSubmissions = lazy(() => import("./pages/ProfileSubmissions"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const NewsManager = lazy(() => import("./pages/admin/NewsManager"));
const LinkedInManager = lazy(() => import("./pages/admin/LinkedInManager"));
const TeamManager = lazy(() => import("./pages/admin/TeamManager"));
const SolutionsManager = lazy(() => import("./pages/admin/SolutionsManager"));
const ResourcesManager = lazy(() => import("./pages/admin/ResourcesManager"));
const ContributorsManager = lazy(() => import("./pages/admin/ContributorsManager"));
const ContentManager = lazy(() => import("./pages/admin/ContentManager"));
const ContactsManager = lazy(() => import("./pages/admin/ContactsManager"));
const FAQManager = lazy(() => import("./pages/admin/FAQManager"));

const queryClient = new QueryClient();

const RouteLoadingState = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-6 py-24 text-sm uppercase tracking-[0.24em] text-muted-foreground">
    Loading page
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PendingSubmissionHandler />
        <Suspense fallback={<RouteLoadingState />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:slug" element={<SolutionDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:slug" element={<ResourceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/team/:slug" element={<TeamProfile />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

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

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/news" element={<NewsManager />} />
            <Route path="/admin/linkedin" element={<LinkedInManager />} />
            <Route path="/admin/team" element={<TeamManager />} />
            <Route path="/admin/solutions" element={<SolutionsManager />} />
            <Route path="/admin/resources" element={<ResourcesManager />} />
            <Route path="/admin/contributors" element={<ContributorsManager />} />
            <Route path="/admin/content" element={<ContentManager />} />
            <Route path="/admin/contacts" element={<ContactsManager />} />
            <Route path="/admin/faq" element={<FAQManager />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
