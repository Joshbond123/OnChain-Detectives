import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { insertSubmissionSchema, type InsertSubmission, type AdminSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, Loader2, Upload, Wallet, Database, User, Lock, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function CaseForm() {
  const { toast } = useToast();
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InsertSubmission>({
    resolver: zodResolver(insertSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      walletAddress: "",
      description: "",
      amountLost: "",
      platform: "",
      evidenceFiles: [],
    },
  });

  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSubmission) => {
      const res = await apiRequest("POST", "/api/submissions", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Case Submitted",
        description: "Your case has been recorded. Redirecting to WhatsApp for final review...",
      });
      
      const whatsappNumber = settings?.whatsappNumber || "1234567890";
      const message = `Hello OnChain Detectives, I just submitted a recovery case.\n\nName: ${data.name}\nWallet: ${data.walletAddress || 'Not provided'}\nAmount: ${data.amountLost || 'Not specified'}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    // In a real app, this would upload to S3/Cloudinary. 
    // Here we simulate and use base64 for the demonstration/task requirements.
    try {
      const newFiles = await Promise.all(
        Array.from(selectedFiles).map(async (file) => {
          return new Promise<{ name: string; url: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({ name: file.name, url: reader.result as string });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      form.setValue("evidenceFiles", updatedFiles.map(f => f.url));
      toast({ title: "Files uploaded", description: `${newFiles.length} file(s) added successfully.` });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    form.setValue("evidenceFiles", updated.map(f => f.url));
  };

  function onSubmit(data: InsertSubmission) {
    if (!data.walletAddress && (!data.evidenceFiles || data.evidenceFiles.length === 0)) {
      toast({
        title: "Evidence Required",
        description: "Please provide either a wallet address or upload evidence screenshots.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 selection:bg-primary/30">
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-4xl px-4 mx-auto">
          <div className="mb-12 text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20"
            >
              <Shield className="text-primary w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
              Recovery Case Submission
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Please provide as much detail as possible. Our forensic team will review your case within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Contact Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-400">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="bg-white/5 border-white/10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-400">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" className="bg-white/5 border-white/10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Incident Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="amountLost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-400">Amount Lost</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 0.5 BTC" className="bg-white/5 border-white/10" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-400">Platform/Exchange</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. MetaMask, Binance" className="bg-white/5 border-white/10" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-400">Case Summary</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us what happened..." 
                                className="min-h-[120px] bg-white/5 border-white/10 resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-primary/10 bg-primary/5 py-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Evidence Submission</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <p className="text-sm text-zinc-400">
                        Please provide at least one of the following for our detectives to begin the trace.
                      </p>
                      
                      <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Scammer's Wallet Address</FormLabel>
                            <FormControl>
                              <Input placeholder="0x..." className="bg-zinc-950 border-white/10 font-mono" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription className="text-xs">The destination address where funds were sent.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormLabel className="text-zinc-300">Evidence Screenshots</FormLabel>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-zinc-950/50 hover:bg-zinc-900 hover:border-primary/30 cursor-pointer transition-all"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Upload className="h-5 w-5 text-primary" />}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-zinc-200">Click to upload files</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or PDF</p>
                          </div>
                          <input 
                            type="file" 
                            multiple 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                            accept="image/*,.pdf"
                          />
                        </div>

                        {files.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {files.map((file, idx) => (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square bg-zinc-900">
                                <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => removeFile(idx)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                    )}
                    {mutation.isPending ? "Submitting Case..." : "Submit for Investigation"}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="space-y-6">
              <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Security Check</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Shield className="h-3 w-3 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All data is encrypted in transit and stored in our secure blockchain forensic vault.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Lock className="h-3 w-3 text-blue-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We never share your information with third parties without explicit legal consent.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Need help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our team is available 24/7 on WhatsApp for urgent assistance.
                  </p>
                  <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10" onClick={() => (window as any).triggerWhatsApp()}>
                    Chat with an Agent
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

