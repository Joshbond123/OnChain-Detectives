import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { AdminSettings } from "@shared/schema";

export function WhatsAppButton() {
  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const whatsappNumber = settings?.whatsappNumber?.replace(/\s+/g, '') || "";
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#";

  if (!whatsappNumber) return null;

  return (
    <motion.a
      href={whatsappUrl} 
      target="_blank"
      rel="noopener noreferrer"
      data-testid="link-whatsapp-floating"
      className="fixed bottom-8 right-8 z-[100] flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-2xl shadow-green-500/40 hover:bg-green-600 transition-all duration-500 group"
      whileHover={{ scale: 1.05, rotate: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
    >
      <MessageCircle className="w-9 h-9 text-white" />
      
      <span className="absolute right-full mr-4 bg-white/10 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-2xl">
        Chat With Us
      </span>
      
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
    </motion.a>
  );
}
