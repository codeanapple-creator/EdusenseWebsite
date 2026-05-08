import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ link, label = "Connect on WhatsApp", testid = "whatsapp-connect-btn" }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testid}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bf5b] text-white font-bold px-6 py-3 shadow-lg btn-lift"
    >
      <MessageCircle size={18} strokeWidth={2.5} />
      {label}
    </a>
  );
}
