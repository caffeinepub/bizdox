import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { navigate } from "../../lib/router";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/create": "Create Document",
  "/documents": "My Documents",
  "/drafts": "Drafts",
  "/downloads": "Downloads & Exports",
  "/themes": "Document Themes",
  "/settings": "Account Settings",
  "/admin": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/templates": "Template Manager",
  "/admin/form-builder": "Form Builder",
  "/admin/placeholders": "Placeholder Manager",
  "/admin/themes": "Theme Manager",
  "/admin/payments": "Payment Records",
  "/admin/analytics": "Analytics",
};

interface HeaderProps {
  currentPath: string;
  onMenuToggle: () => void;
}

export default function Header({ currentPath, onMenuToggle }: HeaderProps) {
  const { userProfile, logout, isAdmin } = useAuthContext();
  const title = PAGE_TITLES[currentPath] || "BizDox";

  return (
    <header className="bg-card border-b border-border h-16 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-serif font-semibold text-foreground">
          {title}
        </h1>
        {isAdmin && currentPath.startsWith("/admin") && (
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-9"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-32 truncate">
                {userProfile?.name || "User"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{userProfile?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="w-4 h-4 mr-2" /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
