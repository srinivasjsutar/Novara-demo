// pages/privacy-policy/+Page.jsx

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

export default function PrivacyPolicy() {
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
        <motion.div
          variants={fadeUp}
          className="text-center max-w-[900px] leading-snug font-brushelva"
        >
          <h1 className="text-[22px] sm:text-[32px] lg:text-[64px]">
            Privacy Policy
          </h1>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="px-4 py-10 sm:p-20 lg:p-20"
      >
        <div className="mx-auto max-w-5xl text-[#111827]">
          <h2 className="font-bold text-[18px] sm:text-[24px]">Introduction</h2>
          <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[#374151]">
            We value your privacy and are committed to protecting the personal
            information you share with us through this website.
          </p>

          <h2 className="mt-8 font-bold text-[18px] sm:text-[24px]">
            Information We Collect
          </h2>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#374151]">
            We may collect the following types of information:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Location preferences</li>
            <li>Enquiries related to the project</li>
            <li>Any information voluntarily provided through forms or calls</li>
          </ul>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            3. Use of Information
          </h3>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#374151]">
            Your information is used to:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
            <li>Respond to enquiries and requests</li>
            <li>Share project details, brochures, and updates</li>
            <li>Arrange site visits or follow-ups</li>
            <li>Improve our services and website experience</li>
            <li>Internal record keeping and analytics</li>
          </ul>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            4. Data Protection
          </h3>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
            <li>
              We implement reasonable security measures to safeguard your
              personal information
            </li>
            <li>
              Your data is stored securely and accessed only by authorized
              personnel.
            </li>
          </ul>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            5. Data Sharing
          </h3>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
            <li>
              We do not sell, rent, or trade your personal information to third
              parties.
            </li>
            <li>
              Information may be shared with authorized representatives or
              service partners strictly for project-related communication.
            </li>
          </ul>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            6. Cookies & Tracking
          </h3>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-[14px] sm:text-[16px] text-[#374151]">
            <li>
              This website may use cookies and analytics tools to enhance user
              experience.
            </li>
            <li>
              Cookies help us understand website usage and improve performance.
            </li>
            <li>
              You may disable cookies through your browser settings if you
              prefer.
            </li>
          </ul>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            7. Third-Party Links
          </h3>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#374151]">
            Our website may contain links to external websites. We are not
            responsible for the privacy practices or content of such websites.
          </p>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            8. Consent
          </h3>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#374151]">
            By submitting your details on this website, you consent to the
            collection and use of your information as outlined in this Privacy
            Policy.
          </p>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            9. Updates to Policy
          </h3>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#374151]">
            We reserve the right to update or modify this Privacy Policy at any
            time. Changes will be posted on this page.
          </p>

          <h3 className="mt-6 font-bold text-[16px] sm:text-[18px] text-[#111827]">
            10. Contact Information
          </h3>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#374151]">
            For any queries regarding this Privacy Policy or your data, you may
            contact us through the details provided on this website.
          </p>
        </div>
      </motion.div>

      {/* Floating WhatsApp + Call */}
    <FloatingCT/>

      <Chatbot />
      <Footer />
    </div>
  );
}
