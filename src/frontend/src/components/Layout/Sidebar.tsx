import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  Download,
  FilePlus,
  FileStack,
  FileText,
  FormInput,
  LayoutDashboard,
  LayoutTemplate,
  Leaf,
  Library,
  Palette,
  Settings,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { navigate } from "../../lib/router";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const userNav: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Create Document", path: "/create", icon: FilePlus },
  { label: "My Documents", path: "/documents", icon: FileText },
  { label: "Drafts", path: "/drafts", icon: FileStack },
  { label: "Downloads", path: "/downloads", icon: Download },
  { label: "Themes", path: "/themes", icon: Palette },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Admin Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Templates", path: "/admin/templates", icon: LayoutTemplate },
  { label: "Form Builder", path: "/admin/form-builder", icon: FormInput },
  { label: "Placeholders", path: "/admin/placeholders", icon: Tag },
  { label: "Theme Manager", path: "/admin/themes", icon: Palette },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Template Library", path: "/admin/template-library", icon: Library },
];

interface SidebarProps {
  currentPath: string;
  onClose?: () => void;
}

export default function Sidebar({ currentPath, onClose }: SidebarProps) {
  const { isAdmin, userProfile } = useAuthContext();

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside className="sidebar-gradient h-full flex flex-col text-sidebar-foreground w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="font-serif font-bold text-lg leading-tight text-white">
              BizDox
            </div>
            <div className="text-[10px] text-sidebar-primary leading-tight">
              by SBZ Enterprises
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-sidebar-border/50">
        <div className="text-xs text-sidebar-foreground/60 mb-0.5">
          Signed in as
        </div>
        <div className="text-sm font-medium text-white truncate">
          {userProfile?.name || "User"}
        </div>
        <div className="text-xs text-sidebar-foreground/50 truncate">
          {userProfile?.companyName}
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* User navigation */}
        <div className="mb-1">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">
            Navigation
          </div>
          {userNav.map((item) => {
            const Icon = item.icon;
            const active =
              currentPath === item.path ||
              (item.path === "/dashboard" && currentPath === "/");
            return (
              <button
                type="button"
                key={item.path}
                data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left mb-0.5",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Admin navigation */}
        {isAdmin && (
          <div className="mt-3">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-sidebar-primary/80 font-semibold">
              Admin Panel
            </div>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.path;
              return (
                <button
                  type="button"
                  key={item.path}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                  onClick={() => handleNav(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left mb-0.5",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border/50">
        <div className="text-[10px] text-sidebar-foreground/40 text-center">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sidebar-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </aside>
  );
}
