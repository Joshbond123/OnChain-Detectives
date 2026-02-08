import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Search, 
  FileText, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Lock, 
  ChevronDown,
  Globe,
  Database,
  Fingerprint,
  Activity,
  BarChart3,
  Scale
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-zinc-950 selection:bg-primary/30">
      <Header />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-mesh">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        
        <div className="container px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Professional Crypto Recovery
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
              OnChain <span className="text-primary text-glow">Detectives</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Advanced blockchain forensics and fund recovery. We track, trace, and help recover your lost assets from scammers. <span className="text-foreground font-semibold">Zero upfront fees.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/case-form">
                <Button size="lg" className="min-w-[200px] text-lg font-bold group h-14 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500">
                  Start Your Case
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="min-w-[200px] text-lg h-14 border-white/10 hover:bg-white/5 font-bold transition-all duration-500" onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}>
                Our Process
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </section>

      {/* Trust Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 text-center">
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
                className="flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-500 shadow-lg shadow-primary/5">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-black">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-muted/30 relative">
        <div className="container px-4">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">Forensic <span className="text-primary text-glow">Investigations</span></h2>
            <p className="text-muted-foreground text-xl leading-relaxed">
              We leverage military-grade blockchain analysis tools to create irrefutable evidence reports for law enforcement and exchanges.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              {
                icon: Search,
                title: "Transaction Tracing",
                desc: "We follow the money through mixers, bridges, and layers of obfuscation to identify the final destination."
              },
              {
                icon: FileText,
                title: "Forensic Reports",
                desc: "Certified evidence reports formatted specifically for legal teams and law enforcement agencies worldwide."
              },
              {
                icon: Shield,
                title: "Exchange Collaboration",
                desc: "We maintain direct communication channels with global cryptocurrency platforms to identify and secure illicit assets."
              }
            ].map((service, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="hover-elevate glass-card border-primary/10 h-full rounded-[2rem] p-4 transition-all duration-500 hover:border-primary/50">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8 text-primary shadow-lg shadow-primary/5">
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 font-display group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed font-light">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-32 relative overflow-hidden bg-background">
        <div className="container px-4">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-24 items-center">
            <div className="flex-1 space-y-10">
              <h2 className="text-4xl md:text-6xl font-bold font-display leading-tight tracking-tight">How Recovery <br /><span className="text-primary text-glow">Works</span></h2>
              <div className="space-y-16">
                {[
                  {
                    step: "01",
                    title: "Asset Analysis",
                    desc: "Provide the scammer's wallet address. Our detectives begin a deep-dive scan into the transaction history."
                  },
                  {
                    step: "02",
                    title: "Path Verification",
                    desc: "We trace the funds across multiple blockchains and identify addresses linked to centralized exchanges."
                  },
                  {
                    step: "03",
                    title: "Evidence Filing",
                    desc: "We generate a comprehensive forensic report used by Law Enforcement to issue subpoenas and freeze funds."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-5xl font-black text-primary/10 group-hover:text-primary/30 transition-colors duration-500 font-display">{item.step}</div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-bold font-display group-hover:text-primary transition-colors duration-500">{item.title}</h4>
                      <p className="text-muted-foreground text-lg font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative w-full">
              <div className="relative z-10 rounded-[2.5rem] border border-primary/20 bg-background/50 backdrop-blur-xl p-10 shadow-2xl overflow-hidden group">
                <div className="flex items-center gap-3 mb-8 border-b border-primary/10 pb-6">
                  <Fingerprint className="text-primary w-6 h-6 animate-pulse" />
                  <span className="font-mono text-sm tracking-wider uppercase text-primary/80">BLOCKCHAIN_SCAN_IN_PROGRESS...</span>
                </div>
                <div className="space-y-6 font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
                  <p className="text-primary font-bold tracking-widest">{">"} INITIALIZING TRACE_PROTOCOL_V4.2</p>
                  <p>{">"} SCANNING WALLET: 0x71C...4f92</p>
                  <p className="text-accent font-bold">{">"} PATH DETECTED: BRIDGE_OPTIMISM {"->"} ETH_MAINNET</p>
                  <p>{">"} ANALYZING MIXER SIGNATURES... [DONE]</p>
                  <p className="text-primary font-bold">{">"} GENERATING FORENSIC_REPORT.PDF [COMPLETED]</p>
                  <div className="pt-6 border-t border-primary/10 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span className="text-green-500 font-bold uppercase tracking-widest">Target Exchange Located: KRAKEN.COM</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
              </div>
              <div className="absolute inset-0 bg-primary/10 blur-[120px] -z-10 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-muted/20 relative">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Frequently Asked <span className="text-primary">Questions</span></h2>
            <p className="text-muted-foreground text-xl font-light">
              Clear answers to common inquiries regarding our recovery framework.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                q: "How much do you charge for investigations?",
                a: "We operate on a strictly success-based model. There are zero upfront fees. We only take a percentage of the recovered funds after they are safely back in your possession."
              },
              {
                q: "Can you recover funds from a decentralized wallet?",
                a: "While we cannot 'undo' a transaction, we can trace the funds until they reach a centralized point (like an exchange) where they can be frozen via legal intervention."
              },
              {
                q: "How long does the process take?",
                a: "Preliminary investigations take 24-48 hours. The full recovery process depends on the complexity of the scam and the speed of legal entities, typically ranging from 2 weeks to 3 months."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card px-8 rounded-3xl border-white/5 data-[state=open]:border-primary/40 transition-all duration-300">
                <AccordionTrigger className="text-left text-xl font-bold font-display hover:no-underline py-8">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-lg font-light pb-8">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
