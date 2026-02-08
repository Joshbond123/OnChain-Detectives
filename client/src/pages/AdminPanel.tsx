import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Submission, AdminSettings } from "@shared/schema";
import { Lock, Phone, Database, LogOut, LayoutDashboard, Settings, Menu, X, Eye, Calendar, User, Mail, Landmark, Wallet, ExternalLink, Trash2, FolderOpen, Upload, Loader2, Shield, ShieldCheck, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLocation } from "wouter";

import AdminDashboard from "./AdminDashboard";

export default function AdminPanel() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("admin_auth") === "true";
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newLogoUrl, setNewLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("admin_auth", "true");
    } else {
      localStorage.removeItem("admin_auth");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleSetTab = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('setAdminTab', handleSetTab);
    return () => window.removeEventListener('setAdminTab', handleSetTab);
  }, []);

  // Expose a function to open the panel
  useEffect(() => {
    (window as any).triggerAdminPanel = (forceOpen = false) => {
      if (forceOpen && isAuthenticated) {
        setShowLoginModal(false);
        return;
      }
      setClickCount(prev => {
        if (prev + 1 >= 5) {
          setShowLoginModal(true);
          return 0;
        }
        return prev + 1;
      });
    };
  }, [isAuthenticated]);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    if (fileInputRef.current?.files?.[0]) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("logo", fileInputRef.current.files[0]);
        
        const res = await fetch("/api/admin/logo", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error("Upload failed");
        
        const updatedSettings = await res.json();
        queryClient.setQueryData(["/api/admin/settings"], updatedSettings);
        setNewLogoUrl(null);
        toast({ title: "Success", description: "Logo updated successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload logo", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const deleteSubmissionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/submissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      toast({ title: "Success", description: "Submission deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete submission", variant: "destructive" });
    },
  });

  if (!isAuthenticated) {
    if (!showLoginModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <UICard className="w-full max-w-md shadow-2xl border-primary/20 bg-zinc-900">
          <UICardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover p-0" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-white" />
              )}
            </div>
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
      <aside className={`fixed md:relative z-50 h-full w-64 border-r border-white/10 bg-zinc-900 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover p-0" />
              ) : (
                <Database className="h-5 w-5 text-primary" />
              )}
            </div>
            <span className="font-bold text-xl tracking-tight truncate">Admin Panel</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>

          <Button 
            variant={activeTab === "submissions" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("submissions");
              setSidebarOpen(false);
            }}
            data-testid="nav-submissions"
          >
            <FolderOpen className="h-4 w-4" />
            Submissions
          </Button>
          
          <Button 
            variant={activeTab === "security" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("security");
              setSidebarOpen(false);
            }}
            data-testid="nav-password"
          >
            <Lock className="h-4 w-4" />
            Security
          </Button>

          <Button 
            variant={activeTab === "whatsapp" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("whatsapp");
              setSidebarOpen(false);
            }}
            data-testid="nav-whatsapp"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </Button>

          <Button 
            variant={activeTab === "general" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("general");
              setSidebarOpen(false);
            }}
            data-testid="nav-general"
          >
            <Settings className="h-4 w-4" />
            General
          </Button>

          <Button 
            variant={activeTab === "branding" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("branding");
              setSidebarOpen(false);
            }}
            data-testid="nav-branding"
          >
            <Settings className="h-4 w-4" />
            Branding
          </Button>

          <Button 
            variant={activeTab === "notifications" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setActiveTab("notifications");
              setSidebarOpen(false);
            }}
            data-testid="nav-notifications"
          >
            <Bell className="h-4 w-4" />
            Notifications
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

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white" 
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
          </div>
          <div className="text-sm text-zinc-500">
            System Online
          </div>
        </header>

        <div className="p-8">
          {activeTab === "dashboard" && (
            <AdminDashboard />
          )}

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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLocation(`/admin/submission/${sub.id}`);
                          }}
                        >
                          <TableCell className="text-zinc-500 font-mono text-xs">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="font-medium text-white">{sub.name}</TableCell>
                          <TableCell className="text-zinc-400">{sub.email}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border-white/5"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setLocation(`/admin/submission/${sub.id}`);
                                }}
                                data-testid={`button-open-${sub.id}`}
                              >
                                <FolderOpen className="h-4 w-4" /> Open
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 gap-2"
                                onClick={() => {
                                  if (confirm("Are you sure you want to permanently delete this submission?")) {
                                    deleteSubmissionMutation.mutate(sub.id);
                                  }
                                }}
                                disabled={deleteSubmissionMutation.isPending}
                                data-testid={`button-delete-${sub.id}`}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </div>
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

          {activeTab === "general" && (
            <div className="max-w-md mx-auto">
              <UICard className="bg-zinc-900 border-white/10">
                <UICardHeader>
                  <UICardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> General Settings
                  </UICardTitle>
                  <CardDescription>Configure basic site information</CardDescription>
                </UICardHeader>
                <UICardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Office Address</label>
                    <Input
                      id="office-address"
                      placeholder="e.g. London, UK"
                      defaultValue={settings?.address}
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const val = (document.getElementById("office-address") as HTMLInputElement).value;
                      updateSettingsMutation.mutate({ address: val });
                    }}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Address"}
                  </Button>
                </UICardContent>
              </UICard>
            </div>
          )}

          {activeTab === "security" && (
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

          {activeTab === "branding" && (
            <div className="max-w-md mx-auto">
              <UICard className="bg-zinc-900 border-white/10">
                <UICardHeader>
                  <UICardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Branding Settings
                  </UICardTitle>
                  <CardDescription>Manage website logo and browser icon</CardDescription>
                </UICardHeader>
                <UICardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-white/10 rounded-2xl bg-zinc-950/50">
                    <div className="w-32 h-32 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                      {newLogoUrl || settings?.logoUrl ? (
                        <img 
                          src={newLogoUrl || settings?.logoUrl || ""} 
                          alt="Logo Preview" 
                          className="w-full h-full object-cover p-0" 
                        />
                      ) : (
                        <Shield className="w-12 h-12 text-zinc-800" />
                      )}
                    </div>
                    
                    <div className="flex flex-col w-full gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="border-white/10 w-full"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        {newLogoUrl ? "Change Selection" : "Select New Logo"}
                      </Button>
                      <Button 
                        onClick={saveLogo} 
                        disabled={!newLogoUrl || updateSettingsMutation.isPending}
                        className="w-full"
                      >
                        {updateSettingsMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Apply Site-wide
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-white/5 p-4 rounded-lg border border-white/5">
                    <p><strong>Note:</strong> Uploading a new logo will automatically update the header, admin screens, and the browser tab icon (favicon) across the entire site.</p>
                  </div>
                </UICardContent>
              </UICard>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-md mx-auto space-y-6">
              <UICard className="bg-zinc-900 border-white/10">
                <UICardHeader>
                  <UICardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Notifications Settings
                  </UICardTitle>
                  <CardDescription>Enable real-time browser notifications for new cases</CardDescription>
                </UICardHeader>
                <UICardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-white">Browser Notifications</Label>
                      <p className="text-xs text-zinc-500">Enable or disable alerts globally</p>
                    </div>
                    <Switch 
                      checked={settings?.notificationsEnabled === "true"}
                      onCheckedChange={(checked) => {
                        updateSettingsMutation.mutate({ notificationsEnabled: checked ? "true" : "false" });
                      }}
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Device Status</div>
                    <div className="p-4 rounded-lg bg-zinc-950/50 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Permission:</span>
                        <span className={`font-medium ${Notification.permission === 'granted' ? 'text-green-500' : Notification.permission === 'denied' ? 'text-red-500' : 'text-yellow-500'}`}>
                          {Notification.permission}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Current Device:</span>
                        <span className="text-white truncate max-w-[150px]" title={navigator.userAgent}>
                          {navigator.userAgent.split(') ')[0].split(' (')[1] || 'Unknown Device'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full border-white/10"
                      onClick={async () => {
                        try {
                          const permission = await Notification.requestPermission();
                          if (permission === 'granted') {
                            const registration = await navigator.serviceWorker.register('/sw.js');
                            const response = await fetch('/api/admin/push/vapid-key');
                            const { publicKey } = await response.json();
                            
                            const subscription = await registration.pushManager.subscribe({
                              userVisibleOnly: true,
                              applicationServerKey: publicKey
                            });

                            const subData = subscription.toJSON();
                            await fetch('/api/admin/push/subscribe', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                endpoint: subData.endpoint,
                                p256dh: subData.keys?.p256dh,
                                auth: subData.keys?.auth,
                                userAgent: navigator.userAgent
                              })
                            });

                            toast({ title: "Subscribed", description: "This device is now registered for notifications" });
                          } else {
                            toast({ title: "Permission Denied", description: "Please enable notifications in your browser settings", variant: "destructive" });
                          }
                        } catch (err) {
                          console.error(err);
                          toast({ title: "Error", description: "Failed to enable notifications", variant: "destructive" });
                        }
                      }}
                    >
                      {Notification.permission === 'granted' ? 'Re-sync Subscription' : 'Grant Permission'}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground bg-white/5 p-4 rounded-lg border border-white/5">
                    <p><strong>Info:</strong> Notifications are device-specific. You must grant permission on each browser/device you wish to receive alerts on.</p>
                  </div>
                </UICardContent>
              </UICard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Adding CheckCircle2 to icons
import { CheckCircle2 } from "lucide-react";

