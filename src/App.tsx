import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PendingSubmissionHandler } from "./components/home/PendingSubmissionHandler";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyPage } from "@/lib/lazyPage";

// Every route loads through lazyPage so a stale tab reloads instead of blanking
const Index = lazyPage(() => import("./pages/Index"));
const News = lazyPage(() => import("./pages/News"));
const NewsArticle = lazyPage(() => import("./pages/NewsArticle"));
const Solutions = lazyPage(() => import("./pages/Solutions"));
const SolutionDetail = lazyPage(() => import("./pages/SolutionDetail"));
const Resources = lazyPage(() => import("./pages/Resources"));
const ResourceDetail = lazyPage(() => import("./pages/ResourceDetail"));
const About = lazyPage(() => import("./pages/About"));
const TeamProfile = lazyPage(() => import("./pages/TeamProfile"));
const Evidence = lazyPage(() => import("./pages/Evidence"));
const Press = lazyPage(() => import("./pages/Press"));
const Terms = lazyPage(() => import("./pages/Terms"));
const Unsubscribe = lazyPage(() => import("./pages/Unsubscribe"));
const Login = lazyPage(() => import("./pages/Login"));
const Signup = lazyPage(() => import("./pages/Signup"));
const VerifyEmail = lazyPage(() => import("./pages/VerifyEmail"));
const Profile = lazyPage(() => import("./pages/Profile"));
const ProfileSubmissions = lazyPage(() => import("./pages/ProfileSubmissions"));
const NotFound = lazyPage(() => import("./pages/NotFound"));

const AdminLogin = lazyPage(() => import("./pages/admin/Login"));
const AdminDashboard = lazyPage(() => import("./pages/admin/Dashboard"));
const NewsManager = lazyPage(() => import("./pages/admin/NewsManager"));
const LinkedInManager = lazyPage(() => import("./pages/admin/LinkedInManager"));
const TeamManager = lazyPage(() => import("./pages/admin/TeamManager"));
const SolutionsManager = lazyPage(() => import("./pages/admin/SolutionsManager"));
const ResourcesManager = lazyPage(() => import("./pages/admin/ResourcesManager"));
const ContributorsManager = lazyPage(() => import("./pages/admin/ContributorsManager"));
const ContentManager = lazyPage(() => import("./pages/admin/ContentManager"));
const ContactsManager = lazyPage(() => import("./pages/admin/ContactsManager"));
const FAQManager = lazyPage(() => import("./pages/admin/FAQManager"));

const queryClient = new QueryClient();

// Branded route loader — the ECG trace draws while the chunk loads
const RouteLoadingState = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-24"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 600 40"
      className="h-8 w-full max-w-xs text-accent"
      preserveAspectRatio="none"
    >
      <path
        className="ecg-path-fast"
        d="M0 24 H150 l12 -7 12 7 h60 l8 -18 10 30 8 -34 10 26 6 -11 h70 l10 -6 10 6 h234"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
      Loading
    </span>
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
            <Route path="/press" element={<Press />} />
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
