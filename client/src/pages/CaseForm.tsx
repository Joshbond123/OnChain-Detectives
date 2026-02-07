import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ArrowRight, Loader2, Upload, Wallet, FileText, CheckCircle2, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Progress } from "@/components/ui/progress";

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
    <div className="flex flex-col min-h-screen w-full bg-background selection:bg-primary/30">
      <Header />
      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-3xl px-4 mx-auto">
          <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden">
            <div className="h-2 bg-primary/20 w-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: mutation.isPending ? '60%' : '0%', transition: 'width 2s' }} />
            </div>
            <CardHeader className="text-center space-y-4 py-8">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <Shield className="text-primary w-10 h-10" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-4xl font-display font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  Recover Your Assets
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg max-w-lg mx-auto">
                  Submit your case details securely. Our blockchain forensic experts will analyze your transaction history immediately.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-lg">General Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors" {...field} />
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
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amountLost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Loss</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2.5 BTC" className="h-12 bg-white/5 border-white/10" {...field} value={field.value || ""} />
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
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Exchange/App Used</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Trust Wallet, Binance" className="h-12 bg-white/5 border-white/10" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-lg">Case Evidence</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recipient's Wallet Address</FormLabel>
                            <FormDescription className="text-xs">Provide the address where the funds were sent (if known)</FormDescription>
                            <FormControl>
                              <Input placeholder="0x..." className="h-12 bg-white/5 border-white/10 font-mono text-sm" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Screenshots & Proof</FormLabel>
                        <FormDescription className="text-xs">Upload transaction receipts, chat logs, or scammer profiles</FormDescription>
                        
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 hover:border-primary/30 cursor-pointer transition-all"
                        >
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Click to upload files</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or PDF (Max 10MB per file)</p>
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            {files.map((file, idx) => (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-zinc-900">
                                <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => removeFile(idx)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Case Summary</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe exactly what happened step-by-step..."
                              className="min-h-[150px] bg-white/5 border-white/10 focus:border-primary/50 resize-none p-4 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By submitting this form, you authorize our forensic team to conduct an initial screening of the provided data. Your information is protected by attorney-client privilege.
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-16 text-xl font-bold shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.99]" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                          Submitting Case...
                        </>
                      ) : (
                        <>
                          Submit Recovery Request
                          <ArrowRight className="ml-3 h-7 w-7" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

