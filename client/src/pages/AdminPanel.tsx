import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Submission, AdminSettings } from "@shared/schema";
import { Lock, Phone, Database, LogOut, LayoutDashboard, Settings, Menu, X, Eye, Calendar, User, Mail, Landmark, Wallet, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminPanel() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState("submissions");

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

  const { data: settings } = useQuery<AdminSettings>({
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
      setShowLoginModal(false);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <UICard className="w-full max-w-md shadow-2xl border-primary/20 bg-zinc-900">
          <UICardHeader className="text-center">
            <UICardTitle className="text-2xl font-bold text-white">Admin Access</UICardTitle>
            <CardDescription>Enter password to access the dashboard</CardDescription>
          </UICardHeader>
          <UICardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && authMutation.mutate(password)}
                className="pl-10 bg-zinc-800 border-white/10 text-white"
                autoFocus
                data-testid="input-admin-password"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                className="flex-1 text-white hover:bg-white/5"
                onClick={() => {
                  setShowLoginModal(false);
                  setPassword("");
                }}
                data-testid="button-cancel-login"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => authMutation.mutate(password)}
                disabled={authMutation.isPending}
                data-testid="button-submit-login"
              >
                {authMutation.isPending ? "Verifying..." : "Unlock"}
              </Button>
            </div>
          </UICardContent>
        </UICard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-950 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 bg-zinc-900/50 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant={activeTab === "submissions" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("submissions")}
            data-testid="nav-submissions"
          >
            <LayoutDashboard className="h-4 w-4" />
            Submissions
          </Button>
          
          <Button 
            variant={activeTab === "password" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("password")}
            data-testid="nav-password"
          >
            <Lock className="h-4 w-4" />
            Security
          </Button>

          <Button 
            variant={activeTab === "whatsapp" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("whatsapp")}
            data-testid="nav-whatsapp"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </Button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 h-11"
            onClick={() => setIsAuthenticated(false)}
            data-testid="nav-logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
          <div className="text-sm text-zinc-500">
            System Online
          </div>
        </header>

        <div className="p-8">
          {activeTab === "submissions" && (
            <div className="space-y-6">
              <UICard className="bg-zinc-900 border-white/10">
                <UICardHeader>
                  <UICardTitle>Form Submissions</UICardTitle>
                  <CardDescription>Manage and view all incoming user inquiries</CardDescription>
                </UICardHeader>
                <UICardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-zinc-800/50">
                      <TableRow className="border-white/10">
                        <TableHead className="text-zinc-400">Date</TableHead>
                        <TableHead className="text-zinc-400">Name</TableHead>
                        <TableHead className="text-zinc-400">Email</TableHead>
                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions?.map((sub) => (
                        <TableRow 
                          key={sub.id} 
                          className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <TableCell className="text-zinc-500 font-mono text-xs">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="font-medium text-white">{sub.name}</TableCell>
                          <TableCell className="text-zinc-400">{sub.email}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="secondary" size="sm" className="h-8 gap-2">
                              <Eye className="h-4 w-4" /> Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!submissions || submissions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                            {loadingSubs ? "Fetching submissions..." : "No data available."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </UICardContent>
              </UICard>
            </div>
          )}

          {activeTab === "password" && (
            <div className="max-w-md mx-auto">
              <UICard className="bg-zinc-900 border-white/10">
                <UICardHeader>
                  <UICardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" /> Admin Security
                  </UICardTitle>
                  <CardDescription>Update your dashboard access password</CardDescription>
                </UICardHeader>
                <UICardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">New Password</label>
                    <Input
                      id="new-password"
                      type="text"
                      placeholder="••••••••"
                      defaultValue={settings?.password}
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const val = (document.getElementById("new-password") as HTMLInputElement).value;
                      if (!val) return toast({ title: "Error", description: "Password required", variant: "destructive" });
                      updateSettingsMutation.mutate({ password: val });
                    }}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </UICardContent>
              </UICard>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="max-w-md mx-auto">
              <UICard className="bg-zinc-900 border-white/10">
                <UICardHeader>
                  <UICardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-500" /> WhatsApp Settings
                  </UICardTitle>
                  <CardDescription>Configure redirection for form submissions</CardDescription>
                </UICardHeader>
                <UICardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Redirect Number</label>
                    <Input
                      id="whatsapp-number"
                      placeholder="e.g. 15550123456"
                      defaultValue={settings?.whatsappNumber}
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <Button 
                    variant="secondary"
                    className="w-full bg-green-600 hover:bg-green-500 text-white"
                    onClick={() => {
                      const val = (document.getElementById("whatsapp-number") as HTMLInputElement).value;
                      updateSettingsMutation.mutate({ whatsappNumber: val });
                    }}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
                  </Button>
                </UICardContent>
              </UICard>
            </div>
          )}
        </div>
      </main>

      {/* Detailed Submission View */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedSubmission?.name}</DialogTitle>
            <DialogDescription className="text-zinc-400">Submission Details</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <DetailItem label="Email" value={selectedSubmission?.email} icon={<Mail className="h-4 w-4" />} />
              <DetailItem label="Platform" value={selectedSubmission?.platform} icon={<LayoutDashboard className="h-4 w-4" />} />
              <DetailItem label="Amount Lost" value={selectedSubmission?.amountLost} icon={<Landmark className="h-4 w-4" />} />
              <DetailItem label="Wallet" value={selectedSubmission?.walletAddress} icon={<Wallet className="h-4 w-4" />} />
              <div className="col-span-full border-t border-white/10 pt-4 mt-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Description of Case</label>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-lg border border-white/5">
                  {selectedSubmission?.description}
                </p>
              </div>
              
              {selectedSubmission?.evidenceFiles && selectedSubmission.evidenceFiles.length > 0 && (
                <div className="col-span-full space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Attached Evidence</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSubmission.evidenceFiles.map((file, i) => (
                      <a 
                        key={i} 
                        href={file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 border border-white/5 hover:bg-zinc-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-primary" />
                        <span className="text-xs truncate">View Document {i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
      </div>
      <p className="text-sm font-medium text-white bg-zinc-800/50 p-2.5 rounded-md border border-white/5 truncate">
        {value || "Not provided"}
      </p>
    </div>
  );
}
