import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-2xl tracking-wider text-white">
                ONCHAIN<span className="text-primary">DETECTIVES</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              We specialize in advanced blockchain forensics and asset recovery. 
              Our team works tirelessly to trace and recover stolen cryptocurrency 
              using state-of-the-art investigative tools.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-white mb-6 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Crypto Asset Recovery</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Forensic Analysis</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Investment Due Diligence</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Wallet Tracing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OnChain Detectives. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
