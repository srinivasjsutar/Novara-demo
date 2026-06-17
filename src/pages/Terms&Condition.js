// pages/terms-condition/+Page.jsx
import Chatbot from "../components/Chatbot";
import FloatingCT from "../components/FloatingCT";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { motion } from "framer-motion";

const smoothSpring = { type: "spring", stiffness: 80, damping: 18, mass: 0.9 };
const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

// ✅ export default function Page() — Vike requires this exact signature
export default function TermsCondition() {
  return (
    <div className="font-poppins">
      <Header />

      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="min-h-[200px] sm:min-h-[266px] flex flex-col items-center justify-center bg-gradient-to-r from-[#baffd7] to-[#fff] px-4"
      >
        <motion.div variants={fadeUp} className="text-center max-w-[900px] font-brushelva leading-snug">
          {/* ✅ Plain h1 inside motion.div — always in SSR HTML */}
          <h1 className="text-[22px] sm:text-[32px] lg:text-[64px]">Terms & Conditions</h1>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="px-4 py-10 sm:px-6 lg:px-10"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-[#111827]">
            <h2 className="font-bold text-[18px] sm:text-[24px]">Introduction</h2>
            <p className="mt-3 text-[14px] sm:text-[18px] leading-relaxed text-[#374151]">
              By accessing and using this website, you agree to comply with and be bound by these
              Terms & Conditions. If you do not agree, please refrain from using the website.
            </p>
            <p className="mt-3 text-[14px] sm:text-[18px] leading-relaxed text-[#374151]">
              This website is operated for the purpose of providing information related to farmland /
              plotted development projects, including project features, location details, amenities,
              pricing indications, and contact facilitation.
            </p>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">Project Information Disclaimer</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
              <li>
                All information, images, videos, layouts, specifications, and visuals displayed on this
                website are <strong>indicative in nature</strong> and for{" "}
                <strong>informational purposes only.</strong>
              </li>
              <li>
                The developer reserves the right to{" "}
                <strong>modify, alter, or amend</strong>&nbsp; project details, specifications, layouts,
                and pricing without prior notice, subject to statutory approvals.
              </li>
              <li>
                Actual development may vary due to site conditions, approvals, or technical reasons
              </li>
            </ul>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">No Legal or Investment Advice</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
              <li>
                The content on this website does{" "}
                <strong>not constitute legal, financial, or investment advice.</strong>
              </li>
              <li>
                Prospective buyers are advised to conduct{" "}
                <strong>independent due diligence,</strong> including verification of land titles,
                approvals, zoning, and local regulations before making any purchase decision.
              </li>
            </ul>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">Pricing & Availability</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
              <li>Prices mentioned (if any) are indicative and subject to change without notice.</li>
              <li>Availability of plots/farmland is subject to confirmation at the time of booking.</li>
              <li>
                Booking is confirmed only upon receipt of the prescribed amount and execution of
                relevant agreements.
              </li>
            </ul>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">Site Visits & Amenities</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
              <li>
                Site visits are provided for convenience and do not guarantee availability or final
                allotment.
              </li>
              <li>
                Amenities mentioned are proposed and may be delivered in phases as per the project plan.
              </li>
            </ul>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">Intellectual Property</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
              <li>
                All content on this website, including text, images, videos, logos, designs, and
                layouts, is the intellectual property of the developer/brand.
              </li>
              <li>Unauthorized copying, reproduction, or use of content is strictly prohibited.</li>
            </ul>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">Limitation of Liability</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
              <li>
                The developer shall not be liable for any direct or indirect loss arising from reliance
                on the information provided on this website
              </li>
              <li>
                The website may contain links to third-party platforms; the developer is not responsible
                for their content or practices.
              </li>
            </ul>

            <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">Governing Law</h2>
            <p className="mt-3 text-[14px] sm:text-[18px] leading-relaxed text-[#374151]">
              These Terms & Conditions shall be governed by and interpreted in accordance with the laws
              of <strong>India</strong>, and any disputes shall be subject to the jurisdiction of the
              competent courts in the respective state.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating WhatsApp + Call */}
      <FloatingCT/>

      <Chatbot />
      <Footer />
    </div>
  );
}
