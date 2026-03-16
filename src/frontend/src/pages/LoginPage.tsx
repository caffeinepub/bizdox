import { Button } from "@/components/ui/button";
import { FileText, Leaf, Settings, Zap } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d3520] via-[#1F6F43] to-[#0d3520] flex items-center justify-center p-4">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-modal p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-primary leading-tight">
                BizDox
              </h1>
              <p className="text-sm font-medium" style={{ color: "#C9A227" }}>
                by SBZ Enterprises
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Professional Trade Document Platform
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generate international trade documents for agro commodity exports
              — cashew, rice, sesame, spices, pulses and more.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: FileText, label: "Dynamic Templates" },
              { icon: Settings, label: "Professional Docs" },
              { icon: Zap, label: "Multi-Format Export" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted text-center"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure authentication via Internet Computer Protocol.
            <br />
            No passwords required.
          </p>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Trusted by agro commodity exporters worldwide
        </p>
      </div>
    </div>
  );
}
