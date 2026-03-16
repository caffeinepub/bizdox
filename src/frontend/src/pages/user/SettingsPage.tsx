import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";

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

export default function SettingsPage() {
  const { actor } = useActor();
  const { userProfile, refreshProfile, principal } = useAuthContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name,
        email: userProfile.email,
        companyName: userProfile.companyName,
        country: userProfile.country,
        phone: userProfile.phone,
      });
    }
  }, [userProfile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await actor!.saveCallerUserProfile(
        form.name,
        form.email,
        form.companyName,
        form.country,
        form.phone,
      );
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Account Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your profile information
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-base">
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name</Label>
                <Input
                  data-ocid="settings.name.input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input
                  data-ocid="settings.email.input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Company Name</Label>
                <Input
                  data-ocid="settings.company.input"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Country</Label>
                <select
                  data-ocid="settings.country.select"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  data-ocid="settings.phone.input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              data-ocid="settings.save.primary_button"
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-base">
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Principal ID</span>
            <code className="text-xs bg-muted px-2 py-0.5 rounded max-w-48 truncate">
              {principal || "-"}
            </code>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-semibold capitalize">
              {userProfile?.role || "-"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member Since</span>
            <span>
              {userProfile
                ? new Date(
                    Number(userProfile.createdAt) / 1_000_000,
                  ).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
