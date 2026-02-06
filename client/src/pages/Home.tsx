import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Search, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Activity,
  Globe,
  MessageCircle,
  AlertTriangle,
  Scale,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { insertInquirySchema } from "@shared/schema";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const formSchema = insertInquirySchema.extend({
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const createInquiry = useCreateInquiry();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
      contactInfo: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const contactInfo = values.email ? values.email : values.phone || "No contact info";
    createInquiry.mutate({
      name: values.name,
      message: values.message,
      contactInfo,
    }, {
      onSuccess: () => form.reset()
    });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-mesh">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-3xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Global Blockchain Forensic Experts</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] mb-8">
                Restore Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient text-glow">Crypto Assets</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-xl leading-relaxed font-light">
                Professional recovery from scammers and hackers. No upfront fees, certified forensic evidence, and global law enforcement coordination.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5">
                <Button 
                  size="lg" 
                  onClick={scrollToContact}
                  data-testid="button-hero-contact"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-10 py-8 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 hover-elevate active-elevate-2 group"
                >
                  Start Free Recovery <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-hero-process"
                  onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-white/10 text-white hover:bg-white/5 font-bold text-xl px-10 py-8 rounded-xl backdrop-blur-sm transition-all duration-500"
                >
                  View Our Success Cases
                </Button>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap items-center gap-10 text-sm text-muted-foreground font-medium uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-accent w-5 h-5" />
                  <span>Zero Initial Risk</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="text-accent w-5 h-5" />
                  <span>Worldwide Network</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="text-accent w-5 h-5" />
                  <span>Confidential Handling</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[120px] animate-pulse" />
                <div className="relative glass-card rounded-[3rem] p-8 h-full flex flex-col justify-between overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-primary uppercase tracking-tighter">Live Investigation Panel</div>
                      <div className="text-2xl font-bold font-display">Tracking Tx: 0x8a...2e1f</div>
                    </div>
                    <Activity className="text-accent animate-pulse" />
                  </div>
                  
                  <div className="flex-1 my-8 space-y-4">
                    {[70, 45, 90, 60].map((w, i) => (
                      <div key={i} className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${w}%` }}
                          transition={{ delay: 1 + i * 0.2, duration: 1.5 }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-[10px] space-y-1">
                    <div className="text-primary font-bold">DETECTED: COLD WALLET FLOW</div>
                    <div className="text-white/60">Source: Binance Hot Wallet {"->"} Bridge (Tornado) {"->"} Unknown</div>
                    <div className="text-accent">MATCH FOUND: Exchange KYC Identified (Kraken)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Assets Recovered", value: "$18.4M+", icon: BarChart3 },
              { label: "Success Rate", value: "96.2%", icon: Zap },
              { label: "Investigation Units", value: "24/7", icon: Activity },
              { label: "Exchange Partners", value: "50+", icon: Scale },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-500">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-24">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Our Investigative <span className="text-primary text-glow">Framework</span></h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We move faster than the hackers. Our proprietary technology traces illicit flows in seconds, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Search,
                title: "Forensic Analysis",
                desc: "We use advanced blockchain explorers and database mapping to identify the 'Cash Out' points and KYC endpoints."
              },
              {
                icon: FileText,
                title: "Evidence Dossier",
                desc: "We build a certified forensic report for exchanges, banks, and law enforcement agencies to legally freeze assets."
              },
              {
                icon: Shield,
                title: "Legal Enforcement",
                desc: "Working with specialized legal partners, we secure the return of funds through direct negotiation or court orders."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-10 rounded-[2rem] hover:border-primary/50 transition-all duration-500 relative group overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-5 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility */}
      <section className="py-32 bg-secondary/20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-3xl mt-12">
                    <AlertTriangle className="text-warning w-8 h-8 mb-4" />
                    <div className="text-lg font-bold mb-2">No Upfront Fees</div>
                    <div className="text-sm text-muted-foreground">We only succeed when you do. Our model is based on performance.</div>
                  </div>
                  <div className="glass-card p-6 rounded-3xl">
                    <Scale className="text-accent w-8 h-8 mb-4" />
                    <div className="text-lg font-bold mb-2">Law Enforcement</div>
                    <div className="text-sm text-muted-foreground">Certified data that meets global standards for police reports.</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-3xl">
                    <Search className="text-primary w-8 h-8 mb-4" />
                    <div className="text-lg font-bold mb-2">Deep Tracing</div>
                    <div className="text-sm text-muted-foreground">We trace through mixers and complex bridges to find the source.</div>
                  </div>
                  <div className="glass-card p-6 rounded-3xl mt-12">
                    <Activity className="text-green-500 w-8 h-8 mb-4" />
                    <div className="text-lg font-bold mb-2">Instant Response</div>
                    <div className="text-sm text-muted-foreground">Immediate action on reported cases to maximize recovery chances.</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Why Global Victims <br /><span className="text-accent">Trust Us</span></h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Crypto scammers are professional. We are more professional. Our team consists of former cybercrime officers and blockchain security architects.
              </p>
              <ul className="space-y-6">
                {[
                  "Specialized in Pig Butchering & Romance Scams",
                  "Verified Success across 40+ Jurisdictions",
                  "Direct Access to Exchange Security Teams",
                  "Advanced Forensic Reports (CRA/SAR Standards)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Frequently Asked <span className="text-primary">Questions</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to know about our crypto recovery process.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  q: "Is crypto recovery really possible?",
                  a: "Yes. While the blockchain is anonymous, centralized exchanges require KYC (identity verification). We trace funds to these endpoints and use legal pressure to recover assets."
                },
                {
                  q: "How much do you charge for your services?",
                  a: "We work on a contingency basis, meaning we don't charge any upfront fees. We only take a percentage of the successfully recovered funds."
                },
                {
                  q: "How long does the recovery process take?",
                  a: "Each case is unique. Tracing can happen in hours, but legal coordination with exchanges and authorities typically takes 2-8 weeks."
                },
                {
                  q: "What information do I need to provide?",
                  a: "We need the transaction hashes (TxID) of the funds sent to scammers and a brief description of the incident."
                }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="glass-card px-6 rounded-2xl border-white/5 data-[state=open]:border-primary/50 transition-all duration-300">
                  <AccordionTrigger className="text-left text-lg font-bold hover:no-underline py-6">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-lg pb-6">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto glass-card rounded-[3rem] overflow-hidden">
            <div className="grid lg:grid-cols-5">
              <div className="lg:col-span-2 p-12 md:p-16 bg-primary/5 border-r border-white/5">
                <h3 className="text-3xl font-display font-bold mb-8">Reclaim What Is Yours</h3>
                <p className="text-lg text-muted-foreground mb-12">
                  Submit your case details now. Our team will perform a free preliminary audit of your transaction trail within 12 hours.
                </p>
                
                <div className="space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="text-primary w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Expert Consultation</div>
                      <div className="text-xl font-bold">Priority WhatsApp Desk</div>
                      <a href="https://wa.me/15550123456" className="text-accent flex items-center gap-1 mt-1 hover:underline">
                        Secure Channel <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Shield className="text-accent w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Global Coverage</div>
                      <div className="text-xl font-bold">Active in 180+ Countries</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3 p-12 md:p-16 bg-black/40">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold tracking-wide uppercase">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-lg" {...field} />
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
                            <FormLabel className="text-sm font-semibold tracking-wide uppercase">Email or Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="john@secure.com" className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-lg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold tracking-wide uppercase">Incident Summary & TxHashes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide the total amount lost and transaction IDs if available..." 
                              className="bg-white/5 border-white/10 rounded-xl focus:border-primary/50 min-h-[180px] text-lg p-6" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={createInquiry.isPending}
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl rounded-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500"
                    >
                      {createInquiry.isPending ? "Analysing System..." : (
                        <span className="flex items-center gap-3">
                          Verify & Submit My Case <ArrowRight className="w-6 h-6" />
                        </span>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      *By submitting, you agree to our 256-bit encrypted data handling protocol.
                    </p>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl opacity-60 hover:opacity-100 transition-opacity">
            <h4 className="text-xs font-bold uppercase tracking-widest text-warning mb-4">Official Disclaimer</h4>
            <p className="text-[10px] md:text-xs leading-relaxed text-muted-foreground text-justify font-light">
              OnChain Detectives is an independent blockchain investigative firm. We are not a law enforcement agency, nor do we claim to be one. Recovery of stolen assets is subject to the cooperation of centralized entities and the technical limitations of blockchain tracing. While we maintain a high success rate, results are never guaranteed. We do not provide financial, legal, or investment advice. Our forensic reports are provided for evidentiary purposes to assist you in your pursuit of justice through the appropriate legal channels.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
