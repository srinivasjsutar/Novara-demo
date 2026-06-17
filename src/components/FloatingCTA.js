import { useState } from "react";
import { Phone, FileText, X } from "lucide-react";

export default function FloatingCTA({ onBrochureClick }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-urbanist">
      {/* Action buttons — visible when expanded */}
      {expanded && (
        <>
          {/* Download Brochure */}
          <button
            onClick={() => {
              setExpanded(false);
              onBrochureClick?.();
            }}
            className="flex items-center gap-2 bg-[#DCA000] hover:bg-[#E3A600] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg transition"
          >
            <FileText className="h-4 w-4" />
            Download Brochure
          </button>

          {/* Call Us */}
          <a
            href="tel:+919999999999"
            className="flex items-center gap-2 bg-[#1A614F] hover:bg-[#154f3f] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg transition"
          >
            <Phone className="h-4 w-4" />
            Call Us Now
          </a>
        </>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Close menu" : "Open contact options"}
        className="bg-[#1A614F] hover:bg-[#154f3f] text-white rounded-full p-4 shadow-xl transition-transform active:scale-95"
      >
        {expanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Phone className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}