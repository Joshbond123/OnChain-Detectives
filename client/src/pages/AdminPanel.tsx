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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminPanel() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <UICard className="w-full max-w-md shadow-2xl border-primary/20">
          <UICardHeader className="text-center">
            <UICardTitle className="text-2xl font-bold text-white">Admin Access</UICardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </UICardHeader>
          <UICardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && authMutation.mutate(password)}
                className="pl-10 text-white"
                autoFocus
                data-testid="input-admin-password"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="ghost"
                className="flex-1 text-white hover:bg-white/10"
                onClick={() => setShowLoginModal(false)}
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
                {authMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </div>
          </UICardContent>
        </UICard>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Database className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-white leading-none">OnChain</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Forensics Admin</span>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-1.5">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-12 px-4 text-zinc-400 hover:text-white hover:bg-white/5 group transition-all duration-200" 
          onClick={() => {
             const tabsTrigger = document.querySelector('[data-testid="tabs-trigger-submissions"]') as HTMLElement;
             if (tabsTrigger) tabsTrigger.click();
          }}
          data-testid="link-dashboard"
        >
          <LayoutDashboard className="h-5 w-5 group-hover:text-primary transition-colors" />
          <span className="font-medium">Inquiries</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-12 px-4 text-zinc-400 hover:text-white hover:bg-white/5 group transition-all duration-200" 
          onClick={() => {
             const tabsTrigger = document.querySelector('[data-testid="tabs-trigger-settings"]') as HTMLElement;
             if (tabsTrigger) tabsTrigger.click();
          }}
          data-testid="link-settings"
        >
          <Settings className="h-5 w-5 group-hover:text-primary transition-colors" />
          <span className="font-medium">System Settings</span>
        </Button>
      </div>

      <div className="px-4 mt-auto">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Administrator</span>
              <span className="text-[10px] text-zinc-500">Root Access</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:text-white hover:bg-destructive h-10 px-3 rounded-lg transition-all duration-200" 
            onClick={() => {
              setIsAuthenticated(false);
              setShowLoginModal(false);
              setPassword("");
            }}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r bg-background">
        <SidebarContent />
      </aside>

      <main className="flex-1 lg:pl-64 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex lg:hidden flex-1">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-zinc-950 border-white/10">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="hidden lg:flex flex-1">
            <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block text-muted-foreground">
              {submissions?.length || 0} Total Submissions
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UICard className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
              <UICardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Leads</p>
                    <h3 className="text-2xl font-bold text-white">{submissions?.length || 0}</h3>
                  </div>
                </div>
              </UICardContent>
            </UICard>

            <UICard className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
              <UICardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Phone className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Live Chat</p>
                    <h3 className="text-2xl font-bold text-white">{settings?.whatsappNumber ? "Active" : "Not Set"}</h3>
                  </div>
                </div>
              </UICardContent>
            </UICard>

            <UICard className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
              <UICardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Database className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">System Status</p>
                    <h3 className="text-2xl font-bold text-white">Online</h3>
                  </div>
                </div>
              </UICardContent>
            </UICard>
          </div>

          <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="submissions" className="gap-2" data-testid="tabs-trigger-submissions">
                <Database className="h-4 w-4" /> Submissions
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2" data-testid="tabs-trigger-settings">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="mt-6 animate-in fade-in duration-500">
              <UICard className="border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-md overflow-hidden">
                <UICardHeader className="px-6 py-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <UICardTitle className="text-2xl font-bold text-white">Client Inquiries</UICardTitle>
                      <CardDescription className="text-zinc-400">Real-time overview of recovery requests</CardDescription>
                    </div>
                  </div>
                </UICardHeader>
                <UICardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="w-[180px] text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Received Date</TableHead>
                          <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Client Name</TableHead>
                          <TableHead className="hidden md:table-cell text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Email Contact</TableHead>
                          <TableHead className="hidden sm:table-cell text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                          <TableHead className="text-right text-zinc-400 font-bold uppercase text-[10px] tracking-widest px-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions?.map((sub) => (
                          <TableRow 
                            key={sub.id} 
                            className="group border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            <TableCell className="text-sm text-zinc-500 font-mono">
                              {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell className="font-semibold text-white group-hover:text-primary transition-colors">{sub.name}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-zinc-400">{sub.email}</TableCell>
                            <TableCell className="hidden sm:table-cell text-center">
                              <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">
                                NEW INQUIRY
                              </span>
                            </TableCell>
                            <TableCell className="text-right px-6">
                              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 gap-2 bg-zinc-800 hover:bg-primary hover:text-white transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubmission(sub);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  Review
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!submissions || submissions.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                              {loadingSubs ? "Loading submissions..." : "No recovery inquiries yet."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </UICardContent>
              </UICard>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <UICard className="shadow-2xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
                  <div className="h-1 bg-primary w-full" />
                  <UICardHeader className="pb-4">
                    <UICardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      Access Control
                    </UICardTitle>
                    <CardDescription className="text-zinc-400">Modify your secure admin credentials</CardDescription>
                  </UICardHeader>
                  <UICardContent className="space-y-6 pt-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">New Administrative Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                        <Input
                          id="new-password"
                          type="text"
                          placeholder="••••••••"
                          defaultValue={settings?.password}
                          className="bg-zinc-950/50 border-white/5 pl-10 h-12 text-white focus:border-primary/50 transition-all"
                        />
                      </div>
                      <Button 
                        className="w-full h-12 shadow-lg shadow-primary/10 font-bold uppercase tracking-wider"
                        onClick={() => {
                          const val = (document.getElementById("new-password") as HTMLInputElement).value;
                          if (!val) {
                            toast({ title: "Error", description: "Password cannot be empty", variant: "destructive" });
                            return;
                          }
                          updateSettingsMutation.mutate({ password: val });
                        }}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="button-save-password"
                      >
                        {updateSettingsMutation.isPending ? "Syncing..." : "Update Password"}
                      </Button>
                    </div>
                  </UICardContent>
                </UICard>

                <UICard className="shadow-2xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
                  <div className="h-1 bg-green-500 w-full" />
                  <UICardHeader className="pb-4">
                    <UICardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Phone className="h-5 w-5 text-green-500" />
                      </div>
                      Communication
                    </UICardTitle>
                    <CardDescription className="text-zinc-400">Configure global WhatsApp contact endpoint</CardDescription>
                  </UICardHeader>
                  <UICardContent className="space-y-6 pt-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">WhatsApp Direct Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
                        <Input
                          id="whatsapp-number"
                          placeholder="15550123456"
                          defaultValue={settings?.whatsappNumber}
                          className="bg-zinc-950/50 border-white/5 pl-10 h-12 text-white focus:border-green-500/50 transition-all"
                        />
                      </div>
                      <Button 
                        variant="secondary"
                        className="w-full h-12 shadow-lg bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider"
                        onClick={() => {
                          const val = (document.getElementById("whatsapp-number") as HTMLInputElement).value;
                          updateSettingsMutation.mutate({ whatsappNumber: val });
                        }}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="button-save-whatsapp"
                      >
                        {updateSettingsMutation.isPending ? "Syncing..." : "Save Configuration"}
                      </Button>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/5">
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        <span className="text-green-500 font-bold">Pro Tip:</span> Use international format without + (e.g., 15551234567) to ensure global compatibility.
                      </p>
                    </div>
                  </UICardContent>
                </UICard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Submission Detail Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-primary/20">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-display text-white">{selectedSubmission?.name}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {selectedSubmission?.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {selectedSubmission?.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                  Case ID: #{selectedSubmission?.id}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 p-4 rounded-xl space-y-2 border border-white/5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="h-3 w-3" /> Platform
                  </div>
                  <div className="font-semibold text-lg text-zinc-100">{selectedSubmission?.platform || "—"}</div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl space-y-2 border border-white/5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="h-3 w-3" /> Amount Lost
                  </div>
                  <div className="font-semibold text-lg text-destructive">{selectedSubmission?.amountLost || "—"}</div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl space-y-2 border border-white/5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="h-3 w-3" /> Scammer Wallet
                  </div>
                  <div className="font-mono text-xs text-primary break-all" title={selectedSubmission?.walletAddress || ""}>
                    {selectedSubmission?.walletAddress || "Not provided"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                   Case Description
                </h3>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 leading-relaxed text-zinc-300">
                  {selectedSubmission?.description}
                </div>
              </div>

              {selectedSubmission?.evidenceFiles && selectedSubmission.evidenceFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    Evidence Gallery ({selectedSubmission.evidenceFiles.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedSubmission.evidenceFiles.map((url, idx) => (
                      <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl">
                        <img src={url} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-white" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <Button onClick={() => setSelectedSubmission(null)} variant="outline" className="px-8 border-white/10 hover:bg-white/5 text-white">
                  Close Review
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}


