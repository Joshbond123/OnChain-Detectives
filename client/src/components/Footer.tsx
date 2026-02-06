import { ShieldCheck, Mail, Phone, MapPin, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-white">
                ONCHAIN<span className="text-primary">DETECTIVES</span>
              </span>
            </div>
            <p className="text-muted-foreground text-lg mb-10 max-w-md leading-relaxed">
              The leading global authority in cryptocurrency asset recovery and blockchain forensics. We provide military-grade investigative solutions for victims of cyber-fraud.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-white mb-8 uppercase tracking-widest text-sm">Bureau</h4>
            <ul className="space-y-4">
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors font-medium">Core Services</a></li>
              <li><a href="#process" className="text-muted-foreground hover:text-primary transition-colors font-medium">Our Framework</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Public Reports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Verify Analyst</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-white mb-8 uppercase tracking-widest text-sm">Transparency</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Data Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Legal Status</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Terms of Use</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact Desk</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-display font-bold text-white mb-8 uppercase tracking-widest text-sm">Global Operations</h4>
            <ul className="space-y-5">
              <li className="flex items-center gap-3 text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">cases@onchaindetectives.com</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">+1 (555) 012-3456</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Secure Operations Center: London, UK</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} OnChain Detectives Bureau. Secured by Blockchain Encryption.
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Systems Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Version 4.2.0-F</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
