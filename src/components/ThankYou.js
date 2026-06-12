import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PhoneIcon, MailIcon, ArrowLeft, MessageCircleIcon } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import Footer from "./Footer";
import FloatingCT from "./FloatingCT";
import Chatbot from "./Chatbot";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function ThankYou() {
  // In Vike, state passed via navigate() is available in pageContext.routeParams
  // For form submissions, pass name/phone as URL query params or use a global store.
  // Here we gracefully read them from pageContext if available.
  const pageContext = usePageContext();
  const name = pageContext?.routeParams?.name || "";
  const phone = pageContext?.routeParams?.phone || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen font-urbanist w-full bg-[#FBF3E6]">
      {/* Top brand bar */}
      <div className="w-full bg-[#52A09A]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <img src="/images/logo.svg" alt="Novara Nature Estates" className="h-auto w-[140px] sm:w-[180px] md:w-[240px]" />
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-semibold text-white no-underline hover:bg-white/15 sm:text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </a>
        </div>
      </div>

      {/* Main */}
      <motion.main
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-2 py-8 sm:px-6 sm:py-10 md:py-12 lg:grid-cols-[55%_45%] lg:gap-8 lg:py-16"
      >
        {/* Left */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="order-1 rounded-2xl border border-[#FFEEC3] bg-white p-[12px] shadow-sm sm:order-1 sm:p-8 sm:rounded-3xl md:p-10 lg:p-[24px]"
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-1 sm:gap-4">
              <div className="mt-1 flex shrink-0 rounded-xl bg-[#0F3F3B]/10 p-2.5 sm:rounded-2xl sm:p-3">
                <CheckCircle2 size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-brushelva text-[#0F3F3B] sm:text-3xl md:text-[44px]">Thank You!</h1>
                <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7 md:text-[18px] md:max-w-xl">
                  Your enquiry has been received. Our team will connect with you shortly to share pricing, and site visit details for{" "}
                  <span className="font-bold">Ecovara</span>.
                </p>
              </div>
            </div>

            {(name || phone) && (
              <div className="rounded-xl bg-[#FFF7E5] px-2 py-3 text-sm text-slate-700 sm:rounded-2xl sm:px-5 sm:text-base">
                <div className="font-semibold text-[#0F3F3B]">Submitted Details</div>
                <div className="mt-1.5 space-y-1 text-sm sm:text-base">
                  {name && <div>Name: <span className="font-medium">{name}</span></div>}
                  {phone && <div>Phone: <span className="font-medium">{phone}</span></div>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoPill title="Response time" value="Within 30–60 mins" />
              <InfoPill title="Location" value="Sahakara Nagar, Bengaluru" />
              <InfoPill title="Working hours" value="Mon–Sun 9:30–6:30" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="tel:+918660200662" className="inline-flex items-center justify-center gap-2 rounded-xl no-underline bg-[#0F3F3B] px-5 py-3.5 text-sm font-semibold text-[#FFEFC4] hover:bg-[#0a2926] sm:px-6 sm:py-3">
                <PhoneIcon size={18} />
                Call Now
              </a>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-1">
                <a href="mailto:info@novaranatureestates.com" className="inline-flex items-center justify-center gap-2 rounded-xl border no-underline border-[#0F3F3B] bg-white px-5 py-3.5 text-sm font-semibold text-[#0F3F3B] hover:bg-[#0F3F3B]/5 sm:px-6 sm:py-3">
                  <MailIcon size={18} />
                  Email Us
                </a>
                <a href="/projects" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E0B24A] px-2 no-underline py-3.5 text-sm font-semibold text-[#0F3F3B] hover:brightness-95 sm:px-6 sm:py-3">
                  Explore Project
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-[#FBF3E6] p-[8px] sm:rounded-3xl sm:p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 sm:text-sm">What happens next?</div>
              <ul className="mt-3 space-y-2.5 text-sm leading-5 text-slate-700 sm:mt-4 sm:text-base sm:leading-6 sm:space-y-3">
                <li className="flex gap-2.5"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E0B24A]" />We confirm your requirement.</li>
                <li className="flex gap-2.5"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E0B24A]" />We share brochure + latest pricing + offers (if any).</li>
                <li className="flex gap-2.5"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E0B24A]" />We schedule a private site visit as per your availability.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Right */}
        <motion.aside
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="order-2 rounded-2xl border border-[#FFEEC3] bg-[#FFF7E5] p-3 shadow-sm sm:rounded-3xl sm:p-6 md:p-8"
        >
          <h2 className="text-xl font-brushelva text-[#0F3F3B] sm:text-2xl md:text-[32px]">Quick Contacts</h2>
          <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
            <ContactRow icon={<PhoneIcon size={18} />} label="Phone" value="+91 8660200662" href="tel:+918660200662" />
            <ContactRow icon={<MailIcon size={18} />} label="Email" value="info@novaranatureestates.com" href="mailto:info@novaranatureestates.com" breakAll />
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white sm:rounded-3xl">
            <img src="/images/ecovara_arch.webp" alt="Ecovara" className="h-[180px] w-full object-cover sm:h-[220px]" />
          </div>
          <div className="mt-5 rounded-2xl bg-white p-4 sm:mt-6 sm:rounded-3xl sm:p-5">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600 sm:text-sm">Address</div>
            <p className="mt-2 text-sm leading-5 text-slate-700 sm:text-base sm:leading-6">
              Novara Nature Estates No. 387, 13th Cross, F-Block,<br className="sm:hidden" />
              Sahakar Nagar, Bengaluru, Karnataka 560092
            </p>
          </div>
        </motion.aside>
      </motion.main>

      <Footer />

      {/* Floating CTAs */}
      <FloatingCT/>
      <Chatbot/>
    </div>
  );
}

function InfoPill({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm sm:rounded-2xl sm:px-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">{title}</div>
      <div className="mt-1 text-sm font-semibold text-[#0F3F3B] sm:text-base">{value}</div>
    </div>
  );
}

function ContactRow({ icon, label, value, href, breakAll }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3.5 hover:bg-slate-50 shadow-sm sm:gap-4 sm:px-4 sm:py-4 sm:rounded-2xl no-underline">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFEFC4] text-[#0F3F3B]">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-slate-600 sm:text-[13px]">{label}</div>
        <div className={`mt-0.5 text-sm font-semibold text-[#0F3F3B] sm:text-[14px] sm:mt-0 ${breakAll ? "break-words" : ""}`}>{value}</div>
      </div>
    </a>
  );
}