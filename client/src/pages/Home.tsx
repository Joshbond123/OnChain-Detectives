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
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInquirySchema } from "@shared/schema";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Schema for form
const formSchema = insertInquirySchema.extend({
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

export default function Home() {
  const createInquiry = useCreateInquiry();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
      contactInfo: "", // Handled by combined logic below
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Combine contact info for the backend simple schema
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-body">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Grid & Effects */}
        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-3xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Active Investigations Ongoing
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                Recover Lost Crypto With <span className="text-primary text-glow">Forensic Precision</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl border-l-2 border-primary/50 pl-6">
                We track and recover stolen digital assets using advanced blockchain analytics. 
                No upfront fees—we align our success with yours.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={scrollToContact}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-none clip-path-button shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300"
                >
                  Start Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-primary/50 text-primary hover:bg-primary/10 font-bold text-lg px-8 py-6 rounded-none"
                >
                  How It Works
                </Button>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-8 text-sm text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary w-4 h-4" />
                  <span>No Upfront Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary w-4 h-4" />
                  <span>Global Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary w-4 h-4" />
                  <span>24/7 Support</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Abstract Blockchain Visualization */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Center Core */}
                <div className="absolute inset-0 m-auto w-32 h-32 bg-background border-2 border-primary/30 rounded-full flex items-center justify-center z-20 box-glow">
                  <Shield className="w-16 h-16 text-primary animate-pulse" />
                </div>
                
                {/* Rotating Rings */}
                <div className="absolute inset-0 border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-10 border border-dotted border-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-20 border border-primary/10 rounded-full animate-[spin_10s_linear_infinite]" />
                
                {/* Floating Nodes */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-12 h-12 bg-card border border-white/10 rounded-lg flex items-center justify-center z-20 shadow-lg"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateY(-140px) rotate(-${i * 60}deg)`
                    }}
                    animate={{ 
                      y: [-140, -130, -140],
                    }}
                    transition={{ 
                      duration: 4, 
                      delay: i * 0.5, 
                      repeat: Infinity 
                    }}
                  >
                    {i === 0 && <Lock className="w-5 h-5 text-accent" />}
                    {i === 1 && <Search className="w-5 h-5 text-primary" />}
                    {i === 2 && <Activity className="w-5 h-5 text-green-500" />}
                    {i === 3 && <Globe className="w-5 h-5 text-blue-500" />}
                    {i === 4 && <FileText className="w-5 h-5 text-orange-500" />}
                    {i === 5 && <Shield className="w-5 h-5 text-purple-500" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Recovered", value: "$15M+" },
              { label: "Success Rate", value: "94%" },
              { label: "Cases Solved", value: "850+" },
              { label: "Global Partners", value: "40+" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-primary uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Our Recovery <span className="text-primary">Process</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We employ a systematic, forensic approach to trace your funds across the blockchain and coordinate with authorities for recovery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "01. Trace & Analyze",
                desc: "We deploy proprietary forensic tools to map the flow of stolen funds across bridges, mixers, and exchanges."
              },
              {
                icon: FileText,
                title: "02. Evidence",
                desc: "We generate comprehensive legal-grade reports identifying the destination of funds and KYC-verified entities."
              },
              {
                icon: Lock,
                title: "03. Recover",
                desc: "We coordinate with exchanges and law enforcement to freeze assets and facilitate their return to your wallet."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-card border border-white/5 p-8 hover:border-primary/50 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-display font-bold group-hover:opacity-10 transition-opacity">
                  {i + 1}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Comprehensive <span className="text-primary">Protection</span></h2>
              <p className="text-lg text-muted-foreground mb-8">
                The crypto landscape is fraught with risks. Our team of certified blockchain investigators provides clarity in the chaos.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: "Investment Scam Recovery",
                    desc: "Pig butchering scams, fake ICOs, and rug pulls."
                  },
                  {
                    title: "Wallet Hack Investigation",
                    desc: "Tracing funds from compromised private keys or seed phrases."
                  },
                  {
                    title: "Corporate Due Diligence",
                    desc: "Verifying the legitimacy of crypto projects before investment."
                  }
                ].map((service, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{service.title}</h4>
                      <p className="text-muted-foreground">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              {/* Image Placeholder - Abstract Tech Graphic */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Using Unsplash with descriptive comment */}
                {/* abstract digital network visualization dark blue */}
                <img 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
                  alt="Blockchain Analysis" 
                  className="w-full h-auto opacity-80 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 bg-black/80 backdrop-blur-md p-6 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4 animate-[pulse_2s_infinite]" />
                    </div>
                    <span className="text-xs font-mono text-primary">ANALYZING...</span>
                  </div>
                  <p className="text-sm text-white font-mono">
                    Target Address: 0x7a...3b9c<br/>
                    Status: <span className="text-green-500">Assets Located</span><br/>
                    Destination: Centralized Exchange
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 bg-primary/5">
                <h3 className="text-2xl font-display font-bold mb-6">Start Your Recovery</h3>
                <p className="text-muted-foreground mb-8">
                  Time is critical in crypto recovery. Fill out the form to get a free preliminary assessment of your case.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircleIcon className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Direct WhatsApp</div>
                      <div className="font-bold">+1 (555) 012-3456</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Globe className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Global Availability</div>
                      <div className="font-bold">24/7 Support Team</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12 bg-black/40">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-white/5 border-white/10 focus:border-primary/50" {...field} />
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
                          <FormLabel>Email or Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" className="bg-white/5 border-white/10 focus:border-primary/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell us what happened</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the incident, amount lost, and tx hashes..." 
                              className="bg-white/5 border-white/10 focus:border-primary/50 min-h-[120px]" 
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
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
                    >
                      {createInquiry.isPending ? "Submitting..." : (
                        <span className="flex items-center gap-2">
                          Submit Case Review <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

// Icon helper
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
  )
}
