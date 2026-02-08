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
import { Shield, CheckCircle2, Loader2, Upload, Wallet, Database, User, Lock, Trash2, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function CaseForm() {
  const { toast } = useToast();
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [walletAddresses, setWalletAddresses] = useState<string[]>([""]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InsertSubmission>({
    resolver: zodResolver(insertSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      walletAddresses: [""],
      description: "",
      amountLost: "",
      evidenceFiles: [],
    },
  });

  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSubmission) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("description", data.description);
      if (data.amountLost) formData.append("amountLost", data.amountLost);
      
      walletAddresses.filter(w => w.trim() !== "").forEach((addr) => {
        formData.append("walletAddresses[]", addr);
      });
      
      rawFiles.forEach((file) => {
        formData.append("evidence", file);
      });

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit case");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Case Submitted",
        description: `Your case #${data.caseId} has been recorded. Redirecting to WhatsApp for final review...`,
      });
      
      const whatsappNumber = settings?.whatsappNumber || "1234567890";
      const walletsStr = walletAddresses.filter(w => w.trim() !== "").join(", ");
      const message = `Hello OnChain Detectives,\n\nI just submitted a recovery case.\n\n*Case ID:* ${data.caseId}\n\n*User Details*\nName: ${data.name}\nEmail: ${data.email}\n\n*Scam Details*\nWallets: ${walletsStr || 'Not provided'}\nAmount Lost: ${data.amountLost || 'Not specified'}\nDescription: ${data.description}`;
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
    try {
      const newRawFiles = Array.from(selectedFiles);
      const newPreviews = await Promise.all(
        newRawFiles.map(async (file) => {
          return new Promise<{ name: string; url: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({ name: file.name, url: reader.result as string });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      setRawFiles(prev => [...prev, ...newRawFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      // We don't set evidenceFiles in form anymore as we'll send raw files
      form.setValue("evidenceFiles", ["dummy"]); // Keep validation happy if needed, though schema might allow empty
      toast({ title: "Files added", description: `${newPreviews.length} file(s) added successfully.` });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setRawFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (previews.length <= 1) {
      form.setValue("evidenceFiles", []);
    }
  };

  const addWalletAddress = () => {
    setWalletAddresses([...walletAddresses, ""]);
  };

  const removeWalletAddress = (index: number) => {
    if (walletAddresses.length > 1) {
      const updated = walletAddresses.filter((_, i) => i !== index);
      setWalletAddresses(updated);
    }
  };

  const updateWalletAddress = (index: number, value: string) => {
    const updated = [...walletAddresses];
    updated[index] = value;
    setWalletAddresses(updated);
    form.setValue("walletAddresses", updated);
  };

  function onSubmit(data: InsertSubmission) {
    const activeWallets = walletAddresses.filter(w => w.trim() !== "");
    if (activeWallets.length === 0 && rawFiles.length === 0) {
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
              Submit Your Case
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tell us what happened so we can start investigating. We will review your case and get back to you within 24 hours.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-2xl space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Your Information</CardTitle>
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
                                <Input placeholder="Enter your full name" className="bg-white/5 border-white/10" {...field} />
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
                                <Input type="email" placeholder="email@example.com" className="bg-white/5 border-white/10" {...field} />
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
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Scam Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="amountLost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-400">How much was lost?</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 1.25 ETH, $500" className="bg-white/5 border-white/10" {...field} value={field.value || ""} />
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
                            <FormLabel className="text-zinc-400">What happened?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe how the scam happened in your own words..." 
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
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Proof and Evidence</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <p className="text-sm text-zinc-400">
                        To help us investigate, please provide the scammer's wallet address, upload screenshots of your evidence, or provide both.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-zinc-300">Scammer's Wallet Addresses</FormLabel>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] gap-1"
                            onClick={addWalletAddress}
                          >
                            <Plus className="h-3 w-3" /> Add Another
                          </Button>
                        </div>
                        {walletAddresses.map((addr, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="flex-1">
                              <Input 
                                placeholder="0x..." 
                                className="bg-zinc-950 border-white/10 font-mono" 
                                value={addr}
                                onChange={(e) => updateWalletAddress(idx, e.target.value)}
                              />
                            </div>
                            {walletAddresses.length > 1 && (
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="h-9 w-9 shrink-0"
                                onClick={() => removeWalletAddress(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <FormDescription className="text-xs">Provide the wallet address(es) where you sent the cryptocurrency.</FormDescription>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <FormLabel className="text-zinc-300">Upload Evidence Screenshots</FormLabel>
                          <p className="text-xs text-muted-foreground italic">
                            Helpful evidence includes: transfer confirmations, payment proof, or chat conversations with the scammer.
                          </p>
                        </div>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-zinc-950/50 hover:bg-zinc-900 hover:border-primary/30 cursor-pointer transition-all"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Upload className="h-5 w-5 text-primary" />}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-zinc-200">Click to upload images</p>
                            <p className="text-xs text-muted-foreground">Select one or more screenshots (PNG or JPG)</p>
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

                        {previews.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {previews.map((file, idx) => (
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
                    {mutation.isPending ? "Submitting Case..." : "Submit Case"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

