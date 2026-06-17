// pages/_error/+Page.jsx
//
// Vike's special error page — file MUST live at pages/_error/+Page.jsx
// It handles 404s and other errors. Use `usePageContext()` to read the status code.

import Chatbot from "../components/Chatbot";
import FloatingCT from "../components/FloatingCT";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { navigate } from "vike/client/router"; // replaces useNavigate()

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

      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="
          min-h-[200px] sm:min-h-[266px]
          flex flex-col items-center justify-center
          bg-gradient-to-r from-[#baffd7] to-[#fff]
          px-4
        "
      >
        <motion.p
          variants={fadeUp}
          className="text-[13px] sm:text-[15px] font-semibold tracking-widest text-[#2d7a5a] uppercase mb-3"
        >
          Error 404
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="
            text-center
            text-[22px] sm:text-[32px] lg:text-[64px]
            max-w-[900px]
            leading-snug font-brushelva
          "
        >
          Page Not Found
        </motion.h1>
      </motion.div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="px-4 py-10 sm:p-20 lg:p-20"
      >
        <div className="mx-auto max-w-5xl text-[#111827] flex flex-col items-center text-center">
          <motion.h2
            variants={fadeUp}
            className="font-bold text-[18px] sm:text-[24px] text-[#111827]"
          >
            Oops! This Page doesn't seems to exist
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[#374151] max-w-[520px]"
          >
            The page you're looking for seems to have wandered off into the
            farmlands. It may have been moved, renamed, or no longer exists.
            Let us guide you back to familiar grounds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <button
              onClick={() => navigate("/")}
              className="
                px-8 py-3 rounded-full
                bg-gradient-to-r from-[#2d7a5a] to-[#1a5c41]
                text-white font-semibold text-[14px] sm:text-[15px]
                shadow-md hover:scale-[1.03] transition-transform
              "
            >
              ← Back to Home
            </button>
            <button
              onClick={() => navigate("/contactus")}
              className="
                px-8 py-3 rounded-full
                border-2 border-[#2d7a5a]
                text-[#2d7a5a] font-semibold text-[14px] sm:text-[15px]
                hover:bg-[#f0fff8] hover:scale-[1.03] transition-all
              "
            >
              Contact Support
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating WhatsApp + Call */}
      <FloatingCT/>

      <Chatbot />
      <Footer />
    </div>
  );
}
