import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Submission, AdminSettings } from "@shared/schema";
import { Lock, Phone, Database, LogOut } from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Expose a function to open the panel
  useEffect(() => {
    (window as any).triggerAdminPanel = () => {
      setClickCount(prev => {
        if (prev + 1 >= 5) {
          setShowLoginModal(true);
          return 0;
        }
        return prev + 1;
      });
    };
  }, []);
  
  const { data: submissions, isLoading: loadingSubs } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
    enabled: isAuthenticated,
  });

  const { data: settings, isLoading: loadingSettings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
    enabled: isAuthenticated,
  });

  const authMutation = useMutation({
    mutationFn: async (pass: string) => {
      const res = await apiRequest("POST", "/api/admin/auth", { password: pass });
      return res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({ title: "Authenticated", description: "Welcome to the admin panel" });
    },
    onError: () => {
      toast({ title: "Error", description: "Invalid password", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AdminSettings>) => {
      const res = await apiRequest("POST", "/api/admin/settings", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
  });

  if (!isAuthenticated) {
    if (!showLoginModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <UICard className="w-[400px] shadow-2xl border-primary/20">
          <UICardHeader>
            <UICardTitle>Admin Access</UICardTitle>
          </UICardHeader>
          <UICardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && authMutation.mutate(password)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                className="flex-1"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => authMutation.mutate(password)}
                disabled={authMutation.isPending}
              >
                Login
              </Button>
            </div>
          </UICardContent>
        </UICard>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UICard>
          <UICardHeader>
            <UICardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" /> Admin Password
            </UICardTitle>
          </UICardHeader>
          <UICardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="new-password"
                type="password"
                placeholder="New Password"
                defaultValue={settings?.password}
              />
              <Button onClick={() => {
                const val = (document.getElementById("new-password") as HTMLInputElement).value;
                updateSettingsMutation.mutate({ password: val });
              }}>Update</Button>
            </div>
          </UICardContent>
        </UICard>

        <UICard>
          <UICardHeader>
            <UICardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" /> WhatsApp Configuration
            </UICardTitle>
          </UICardHeader>
          <UICardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="whatsapp-number"
                placeholder="WhatsApp Number (e.g. 1234567890)"
                defaultValue={settings?.whatsappNumber}
              />
              <Button onClick={() => {
                const val = (document.getElementById("whatsapp-number") as HTMLInputElement).value;
                updateSettingsMutation.mutate({ whatsappNumber: val });
              }}>Update</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This number will be used for user redirection after form submission.
            </p>
          </UICardContent>
        </UICard>
      </div>

      <UICard>
        <UICardHeader>
          <UICardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" /> Form Submissions
          </UICardTitle>
        </UICardHeader>
        <UICardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Lost Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "N/A"}</TableCell>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{sub.platform}</TableCell>
                  <TableCell>{sub.amountLost}</TableCell>
                  <TableCell className="max-w-xs truncate" title={sub.description}>
                    {sub.description}
                  </TableCell>
                </TableRow>
              ))}
              {submissions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </UICardContent>
      </UICard>
    </div>
  );
}
