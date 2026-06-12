import Chatbot from "../../src/components/Chatbot";
import Footer from "../../src/components/Footer";
import Header from "../../src/components/Header";
import { motion } from "framer-motion";
import { navigate } from "vike/client/router";

const smoothSpring = { type: "spring", stiffness: 80, damping: 18, mass: 0.9 };
const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

export default function NotFound() {
  return (
    <div className="font-poppins">
      <Header />
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="min-h-[200px] sm:min-h-[266px] flex flex-col items-center justify-center bg-gradient-to-r from-[#baffd7] to-[#fff] px-4"
      >
        <motion.p variants={fadeUp} className="text-[13px] sm:text-[15px] font-semibold tracking-widest text-[#2d7a5a] uppercase mb-3">
          Error 404
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-center text-[22px] sm:text-[32px] lg:text-[64px] max-w-[900px] leading-snug font-brushelva">
          Page Not Found
        </motion.h1>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="px-4 py-10 sm:p-20 lg:p-20"
      >
        <div className="mx-auto max-w-5xl text-[#111827] flex flex-col items-center text-center">
          <motion.h2 variants={fadeUp} className="font-bold text-[18px] sm:text-[24px] text-[#111827]">
            Oops! This Page doesn't seems to exist
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[#374151] max-w-[520px]">
            The page you're looking for seems to have wandered off into the farmlands. It may have been moved, renamed, or no longer exists. Let us guide you back to familiar grounds.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#2d7a5a] to-[#1a5c41] text-white font-semibold text-[14px] sm:text-[15px] shadow-md hover:scale-[1.03] transition-transform"
            >
              ← Back to Home
            </button>
            <button
              onClick={() => navigate("/contactus")}
              className="px-8 py-3 rounded-full border-2 border-[#2d7a5a] text-[#2d7a5a] font-semibold text-[14px] sm:text-[15px] hover:bg-[#f0fff8] hover:scale-[1.03] transition-all"
            >
              Contact Support
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
        className="fixed bottom-16 lg:bottom-5 right-9 lg:right-4 z-[9999] flex flex-col items-end gap-4 font-poppins"
      >
        <a href="https://wa.me/918660200662" target="_blank" rel="noopener noreferrer"
          className="whatsapp-chat sm:hidden w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <img src="/images/whatsapp.svg" alt="whatsapp" className="w-7 h-7" />
        </a>
        <a href="https://wa.me/918660200662" target="_blank" rel="noopener noreferrer"
          className="whatsapp-chat-gtm hidden sm:inline-flex group no-underline relative items-center bg-white pl-3 pr-[70px] py-3 rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.18)] hover:scale-[1.02] transition-transform">
          <span className="text-slate-800 group-hover:text-green-600 font-semibold text-base whitespace-nowrap transition-colors">WhatsApp</span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <img src="/images/whatsapp.svg" alt="whatsapp" className="w-7 h-7" />
          </span>
        </a>
        <a href="tel:+918660200662"
          className="tel-chat sm:hidden w-12 h-12 rounded-xl bg-[#3B46F6] flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <img src="/images/call_ico.svg" alt="call" className="w-7 h-7" />
        </a>
        <a href="tel:+918660200662"
          className="tel-chat-gtm hidden sm:inline-flex group no-underline relative items-center bg-white pl-3 pr-[66px] py-3 rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.18)] hover:scale-[1.02] transition-transform">
          <span className="text-slate-800 group-hover:text-[#3B46F6] font-semibold text-base whitespace-nowrap transition-colors">+91 8660200662</span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#3B46F6] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <img src="/images/call_ico.svg" alt="call" className="w-7 h-7" />
          </span>
        </a>
      </motion.div>

      <Chatbot />
      <Footer />
    </div>
  );
}