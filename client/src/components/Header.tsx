import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ShieldCheck, Menu, X, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Process", href: "#process" },
    { name: "Services", href: "#services" },
    { name: "FAQ", href: "#faq" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? "bg-background/80 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-700" />
              <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl shadow-primary/20">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl md:text-2xl tracking-tighter leading-none text-white">
                ONCHAIN<span className="text-primary">DETECTIVES</span>
              </span>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground group-hover:text-accent transition-colors">
                Asset Recovery Bureau
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button 
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-xs font-bold text-muted-foreground hover:text-white transition-all uppercase tracking-[0.2em] hover:text-glow-accent relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-500" />
              </button>
            ))}
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <Button 
              onClick={() => scrollToSection("#contact")}
              data-testid="button-nav-recovery"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-display uppercase tracking-widest px-6 py-5 rounded-xl transition-all duration-500 shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              Start Investigation
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-lg border border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="container mx-auto px-4 py-10 flex flex-col gap-6">
              {navLinks.map((link) => (
                <button 
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-xl font-display font-bold text-left text-foreground hover:text-primary transition-colors py-2"
                >
                  {link.name}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection("#contact")}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-2xl shadow-primary/20"
              >
                Start Investigation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
