import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppLayout from "./components/Layout/AppLayout";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import FormBuilderPage from "./pages/admin/FormBuilderPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import PlaceholdersPage from "./pages/admin/PlaceholdersPage";
import TemplateLibraryPage from "./pages/admin/TemplateLibraryPage";
import TemplatesPage from "./pages/admin/TemplatesPage";
import ThemeManagerPage from "./pages/admin/ThemeManagerPage";
import UsersPage from "./pages/admin/UsersPage";
import CreateDocumentPage from "./pages/user/CreateDocumentPage";
import DashboardPage from "./pages/user/DashboardPage";
import DownloadsPage from "./pages/user/DownloadsPage";
import DraftsPage from "./pages/user/DraftsPage";
import MyDocumentsPage from "./pages/user/MyDocumentsPage";
import SettingsPage from "./pages/user/SettingsPage";
import ThemesPage from "./pages/user/ThemesPage";

function useHashRouter() {
  const [path, setPath] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return path;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Loading BizDox...</p>
      </div>
    </div>
  );
}

function AppRouter() {
  const path = useHashRouter();
  const { isAuthenticated, userProfile, loading, isAdmin } = useAuthContext();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) return <LoginPage />;

  if (!userProfile) return <ProfileSetupPage />;

  const adminPages: Record<string, React.ReactNode> = {
    "/admin": <AdminDashboardPage />,
    "/admin/users": <UsersPage />,
    "/admin/templates": <TemplatesPage />,
    "/admin/form-builder": <FormBuilderPage />,
    "/admin/placeholders": <PlaceholdersPage />,
    "/admin/themes": <ThemeManagerPage />,
    "/admin/payments": <PaymentsPage />,
    "/admin/analytics": <AnalyticsPage />,
    "/admin/template-library": <TemplateLibraryPage />,
  };

  const userPages: Record<string, React.ReactNode> = {
    "/": <DashboardPage />,
    "/dashboard": <DashboardPage />,
    "/create": <CreateDocumentPage />,
    "/documents": <MyDocumentsPage />,
    "/drafts": <DraftsPage />,
    "/downloads": <DownloadsPage />,
    "/themes": <ThemesPage />,
    "/settings": <SettingsPage />,
  };

  const adminPage = adminPages[path];
  if (adminPage && !isAdmin) {
    return (
      <AppLayout currentPath={path}>
        <DashboardPage />
      </AppLayout>
    );
  }

  const page = adminPage || userPages[path] || <DashboardPage />;
  return <AppLayout currentPath={path}>{page}</AppLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
