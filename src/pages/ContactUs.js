// pages/contactus/+Page.jsx
import { useState } from "react";
import Header from "../../src/components/Header";
import { motion } from "framer-motion";
import ContactForm from "../../src/components/ContactForm";
import Footer from "../../src/components/Footer";
import { navigate } from "vike/client/router";
import Chatbot from "../../src/components/Chatbot";
import FloatingCT from "../components/FloatingCT";
import WhatsAppPopup from "../components/WatsappPopup";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://novara-backend-one.vercel.app";

const smoothSpring = { type: "spring", stiffness: 80, damping: 18, mass: 0.9 };

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const BrochureModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (values) => {
    const newErrors = {};
    if (!values.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!values.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(values.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
      newErrors.email = "Enter a valid email address";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = () => setErrors(validate(formData));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${API_BASE}/pop-up`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          const name = `${formData.firstName} ${formData.lastName}`.trim();
          sessionStorage.setItem(
            "thankyou",
            JSON.stringify({ name, phone: formData.mobile }),
          );
          setFormData({
            firstName: "",
            lastName: "",
            mobile: "",
            email: "",
            message: "",
          });
          setErrors({});
          onClose();
          navigate("/thankyou");
          return;
        } else {
          alert("Something went wrong, please try again.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error submitting the form.");
      }
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6 lg:p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1A614F] mb-2">
            Get Your Brochure
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Fill in your details and we'll send you our detailed brochure
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.firstName}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A614F] transition ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.lastName}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A614F] transition ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mobile Number *
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.mobile}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A614F] transition ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
                placeholder="10-digit mobile number"
              />
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.email}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A614F] transition ${errors.email ? "border-red-500" : "border-gray-300"}`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.message}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A614F] transition resize-none ${errors.message ? "border-red-500" : "border-gray-300"}`}
                placeholder="Tell us what you're interested in..."
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#DCA000] hover:bg-[#E3A600] text-white font-semibold py-3 px-6 rounded-lg border border-[#FFCE4C] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit & Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ContactUs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whatsappTrigger, setWhatsappTrigger] = useState(false);
const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
const [hasWhatsAppAutoOpened, setHasWhatsAppAutoOpened] = useState(false);

  return (
    <div className="font-urbanist">
      <Header />

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="h-[215px] lg:h-[315px] bg-gradient-to-r from-[#D3FFE5] via-[#ffff] to-[#ffff] flex flex-col py-[50px] px-[16px] lg:py-[100px] lg:px-[80px] relative"
      >
        <motion.div
          variants={fadeUp}
          className="relative z-10 text-start font-brushelva lg:w-[1070px] text-[#1A614F]"
        >
          <h1 className="text-[30px] sm:text-[32px] lg:text-[38px]">
            Get in Touch with Novara
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="relative z-10 text-[#2B2B2B] font-urbanist text-[14px] sm:text-[14px] mt-[10px] lg:mt-[10px] lg:w-[1160px] lg:text-[16px]"
        >
          Welcome to Novara Nature Estates Contact Us page. We're here to assist
          you with any inquiries, requests, or feedback you may have.
        </motion.p>
      </motion.div>

      <div className="lg:h-[180px] font-urbanist bg-[#52A09A] p-[10px]">
        <div className="flex flex-col gap-2 justify-center lg:flex-row">
          <div className="flex gap-2 flex-row">

            {/* ✅ Email card — single <a> wrapping entire card content */}
            <a
              href="mailto:info@novaranatureestates.com"
              className="relative bg-white flex flex-col justify-center items-center h-[123px] w-[180px] lg:h-[160px] rounded-lg lg:w-[280px] hover:bg-gray-50 transition no-underline"
            >
              <img
                src="/images/mail.svg"
                alt=""
                className="h-[60px] w-[60px]"
              />
              <img
                src="/images/nav.svg"
                alt=""
                className="absolute top-2 right-2 lg:top-5 lg:right-5"
              />
              <span className="text-[#1A614F] mt-3 p-2 text-[12px] lg:text-[16px] font-semibold">
                info@novaranatureestates.com
              </span>
            </a>

            {/* ✅ Phone card — single <a> wrapping entire card content */}
            <a
              href="tel:+918660200662"
              target="_blank"
              rel="noreferrer"
              className="relative bg-white flex flex-col justify-center items-center h-[123px] w-[180px] lg:h-[160px] rounded-lg lg:w-[340px] hover:bg-gray-50 transition no-underline"
            >
              <img
                src="/images/call.svg"
                alt=""
                className="h-[60px] w-[60px]"
              />
              <img
                src="/images/nav.svg"
                alt=""
                className="absolute top-2 right-2 lg:top-5 lg:right-5"
              />
              <span className="text-[#1A614F] mt-3 p-2 text-[12px] lg:text-[16px] font-semibold">
                +91-8660200662
              </span>
            </a>
          </div>

          <div className="flex gap-2 flex-row">

            {/* ✅ Address card — single <a> wrapping entire card content */}
            <a
              href="https://maps.app.goo.gl/cag4aTqXEW5BEZp87"
              target="_blank"
              rel="noreferrer"
              className="relative bg-white flex flex-col justify-center items-center h-[123px] w-[180px] lg:h-[160px] rounded-lg lg:w-[340px] hover:bg-gray-50 transition no-underline"
            >
              <img
                src="/images/address.svg"
                alt=""
                className="h-[60px] w-[60px]"
              />
              <img
                src="/images/nav.svg"
                alt=""
                className="absolute top-5 right-5"
              />
              <span className="text-[#1A614F] mt-3 p-2 text-[12px] lg:text-[16px] font-semibold">
                Office Location
              </span>
            </a>

            {/* ✅ Social card — nav arrow has no href; each social is one <a> with both image + text inside */}
            <div className="relative bg-white flex flex-wrap lg:flex-col justify-center items-center h-[123px] w-[180px] lg:h-[160px] rounded-lg lg:w-[340px]">
              <img
                src="/images/meta.svg"
                alt=""
                className="h-[60px] w-[60px]"
              />
              {/* nav arrow removed — it had an empty href which created a junk link */}
              <span className="flex gap-2 lg:gap-3">
                <a
                  href="https://www.instagram.com/novaranatureestates/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1A614F] mt-3 p-1 hover:rounded-full hover:bg-gray-200 no-underline font-semibold"
                  aria-label="Novara Nature Estates Instagram"
                >
                  <img
                    src="/images/insta.svg"
                    alt=""
                    className="block lg:hidden w-5 h-5"
                  />
                  <span className="hidden lg:block text-[16px]">Instagram</span>
                </a>
                <a
                  href="https://www.youtube.com/@NovaraNatureEstates"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1A614F] mt-3 p-1 hover:rounded-full hover:bg-gray-200 no-underline font-semibold"
                  aria-label="Novara Nature Estates YouTube"
                >
                  <img
                    src="/images/yt.svg"
                    alt=""
                    className="block lg:hidden w-5 h-5"
                  />
                  <span className="hidden lg:block text-[16px]">YouTube</span>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61585877764871#"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1A614F] mt-3 p-1 hover:rounded-full hover:bg-gray-200 no-underline font-semibold"
                  aria-label="Novara Nature Estates Facebook"
                >
                  <img
                    src="/images/fb.svg"
                    alt=""
                    className="block lg:hidden w-5 h-5"
                  />
                  <span className="hidden lg:block text-[16px]">Facebook</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/novara-nature-estates/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1A614F] mt-3 p-1 hover:rounded-full hover:bg-gray-200 no-underline font-semibold"
                  aria-label="Novara Nature Estates LinkedIn"
                >
                  <img
                    src="/images/linkedin1.svg"
                    alt=""
                    className="block lg:hidden w-5 h-5"
                  />
                  <span className="hidden lg:block text-[16px]">Linked In</span>
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="lg:h-[999px] lg:mt-[60px] lg:py-[80px] lg:px-[80px]"
        style={{
          backgroundImage: "url('/images/contact-form.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h2 className="text-[#FFD972] px-[18px] pt-[10px] text-[28px] lg:text-[50px] font-brushelva">
          Let's Connect
        </h2>
        <p className="text-white px-[18px] pt-[10px] text-[14px] lg:text-[16px] mt-3 lg:w-[1030px] font-urbanist">
          We're excited to connect with you and learn more about your real
          estate goals. Use the form below to get in touch with Novara Nature
          Estates. Whether you're a prospective client, partner, or simply
          curious about our services, we're here to answer your questions and
          provide the assistance you need.
        </p>
        <ContactForm />
      </div>

     <FloatingCT
               onBrochureClick={() => setIsModalOpen(true)}
               onWhatsAppClick={() => setIsWhatsAppOpen(true)}
               isWhatsAppOpen={isWhatsAppOpen}
             />
             <WhatsAppPopup
               isOpen={isWhatsAppOpen}
               onClose={() => setIsWhatsAppOpen(false)}
             />

      <BrochureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Chatbot />
      <Footer />
    </div>
  );
}
