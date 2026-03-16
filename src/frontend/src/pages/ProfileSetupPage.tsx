import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

const COUNTRIES = [
  "India",
  "Tanzania",
  "Ivory Coast",
  "Nigeria",
  "Ghana",
  "Benin",
  "Vietnam",
  "Indonesia",
  "Malaysia",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Germany",
  "Singapore",
  "Other",
];

export default function ProfileSetupPage() {
  const { actor } = useActor();
  const { refreshProfile, logout } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    country: "India",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.name || !form.email || !form.companyName) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await actor.createProfile(
        form.name,
        form.email,
        form.companyName,
        form.country,
        form.phone,
      );
      await refreshProfile();
      toast.success("Profile created! Welcome to BizDox.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d3520] via-[#1F6F43] to-[#0d3520] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">
              Complete Your Profile
            </h1>
            <p className="text-xs text-muted-foreground">
              Set up your BizDox account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                data-ocid="profile.name.input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                data-ocid="profile.email.input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                data-ocid="profile.company.input"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                placeholder="Your company name"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                data-ocid="profile.country.select"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                data-ocid="profile.phone.input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9999999999"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="profile.submit_button"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
