import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { insertSubmissionSchema, type InsertSubmission } from "@shared/schema";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function CaseForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertSubmission>({
    resolver: zodResolver(insertSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      walletAddress: "",
      description: "",
      amountLost: "",
      platform: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSubmission) => {
      const res = await apiRequest("POST", "/api/submissions", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Case Submitted",
        description: "Redirecting you to our investigative team on WhatsApp...",
      });
      
      // WhatsApp redirection logic
      const message = `Hello OnChain Detectives, I just submitted a recovery case.\n\nName: ${data.name}\nWallet: ${data.walletAddress}\nAmount: ${data.amountLost || 'Not specified'}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/1234567890?text=${encodedMessage}`; // Replace with actual business number
      
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

  function onSubmit(data: InsertSubmission) {
    mutation.mutate(data);
  }

  return (
    <div className="container max-w-2xl py-12 px-4">
      <Card className="glass-card border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Shield className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Start Your Recovery</CardTitle>
          <CardDescription className="text-muted-foreground">
            Provide the details of your case. Our detectives will review it immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scammer's Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." className="font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amountLost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Lost (USD/Crypto)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5,000 USDT" {...field} />
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
                      <FormLabel>Platform/Exchange</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Binance, MetaMask" {...field} />
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
                    <FormLabel>Describe the Incident</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide details about how the scam occurred..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit & Connect to WhatsApp
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
