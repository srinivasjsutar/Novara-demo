// pages/whynovara/+Page.jsx
import CTAStrip from "../components/CTAStrip";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { useState } from "react";
import { navigate } from "vike/client/router"; // ✅ Vike navigation (replaces useNavigate)
import Chatbot from "../components/Chatbot";
import FloatingCT from "../components/FloatingCT";
import WhatsAppPopup from "../components/WatsappPopup";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://novara-backend-one.vercel.app";

const viewport = { once: true, amount: 0.25 };

const smoothSpring = { type: "spring", stiffness: 80, damping: 18, mass: 0.9 };
const smoothSpringFast = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -26 },
  show: { opacity: 1, x: 0, transition: smoothSpring },
};

const softScale = {
  hidden: { opacity: 0, scale: 0.98, y: 18 },
  show: { opacity: 1, scale: 1, y: 0, transition: smoothSpringFast },
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
  // ✅ No useNavigate hook needed — navigate is imported directly

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
          setFormData({
            firstName: "",
            lastName: "",
            mobile: "",
            email: "",
            message: "",
          });
          setErrors({});
          onClose();
          // ✅ Vike navigate (replaces useNavigate hook)
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

export default function WhyNovara() {
  const [isModalOpen, setIsModalOpen] = useState(false);
const [whatsappTrigger, setWhatsappTrigger] = useState(false);
const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
const [hasWhatsAppAutoOpened, setHasWhatsAppAutoOpened] = useState(false);

  return (
    <div>
      <Header />

      {/* Hero block */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        style={{
          backgroundImage: "url('/images/aboutus_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="h-[300px] px-2 lg:h-[400px] flex flex-col items-center justify-center relative"
      >
        <motion.div
          variants={fadeUp}
          className="relative z-10 text-center text-white font-brushelva lg:w-[700px]"
        >
          <h1 className="text-[30px] sm:text-[32px] lg:text-[50px]">
            Building Sustainable Farmland Investments Near Bangalore
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="relative z-10 text-center text-[#2B2B2B] font-urbanist text-white/75 text-[14px] lg:w-[648px] sm:text-[14px] mt-[10px] lg:mt-[10px] lg:text-[20px]"
        >
          Thoughtfully planned farmland near Bangalore offering peaceful living,
          sustainable growth, and easy access to modern essentials.
        </motion.p>
      </motion.div>

      {/* Who We Are */}
      <div className="bg-gradient-to-b from-[#D3FFE5] via-[#e8fff2e5] to-[#FEFFFF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-[100px] py-[30px] lg:py-[70px]">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[70px] items-center">
            <motion.div
              variants={staggerWrap}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="w-full max-w-[677px] flex flex-col justify-center text-left"
            >
              <motion.h2
                variants={fadeUp}
                className="text-[28px] text-[#166D22] font-brushelva sm:text-[36px] lg:text-[44px] leading-tight"
              >
                Who We Are
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-[14px] font-urbanist lg:w-[599px] sm:text-[16px] lg:text-[18px] lg:pt-3 text-[#2B2B2B] leading-relaxed"
              >
                <strong>Novara Nature Estates</strong> brings together nature
                and modern living by offering thoughtfully planned{" "}
                <strong>farmland near Bangalore</strong>. With a strong focus on
                agriculture and sustainability, we make farmland ownership
                simple, secure, and rewarding for both lifestyle seekers and
                long-term investors.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-[14px] font-urbanist lg:w-[599px] sm:text-[16px] lg:text-[18px] text-[#2B2B2B] leading-relaxed lg:mt-2"
              >
                Our managed farmlands are strategically located near major
                highways and key landmarks, ensuring easy access to Bangalore,
                industrial hubs, schools, hospitals, and daily essentials while
                still offering peace, greenery, and a deep connection with
                nature.
              </motion.p>

              <motion.div
                variants={staggerWrap}
                className="pt-6 grid grid-cols-3 font-urbanist gap-6"
              >
                {[
                  { value: "15+", label: "Years of Experience" },
                  { value: "4", label: "Projects Completed" },
                  { value: "450+", label: "Happy Clients" },
                ].map(({ value, label }) => (
                  <motion.div
                    key={label}
                    variants={softScale}
                    className="flex flex-col lg:flex-row lg:gap-2 justify-center text-center items-center"
                  >
                    <span className="text-[24px] sm:text-[32px] lg:text-[44px] text-[#166D22] font-bold leading-none">
                      {value}
                    </span>
                    <span className="text-[14px] sm:text-[14px] lg:text-[16px] text-[#2B2B2B] leading-snug">
                      {label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="w-[461px] hidden sm:block h-[461px]"
            >
              <motion.img
                src="/images/who_we_are.png"
                alt="About us"
                className="w-full h-auto rounded-xl"
                initial={{ scale: 1.02 }}
                whileInView={{ scale: 1 }}
                viewport={viewport}
                transition={smoothSpring}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div
        className="bg-no-repeat bg-cover bg-center flex flex-col lg:flex-row justify-center items-center p-3 lg:p-0 gap-3 lg:gap-[60px] lg:h-[500px]"
        style={{ backgroundImage: "url('/images/specification.webp')" }}
      >
        <div className="lg:w-[500px]">
          <img src="/images/updated_icon.svg" alt="sparkle" />
          <div className="font-brushelva text-[#FFD871] text-[28px] lg:pb-[10px] lg:text-[38px]">
            Our Values
          </div>
          <p className="text-[14px] lg:text-[16px] font-urbanist text-white">
            Our journey is shaped by steady growth and purposeful progress. What
            began as a small team with big aspirations has grown into a
            vision-driven platform, committed to creating meaningful real estate
            experiences beyond the ordinary.
          </p>
        </div>

        <div className="bg-white font-urbanist p-[20px] lg:p-[20px] lg:w-[740px] lg:h-[350px] rounded-xl">
          <div>
            <div className="flex flex-col lg:flex-row">
              <div>
                <div className="flex items-center gap-[10px]">
                  <img src="/images/star.svg" alt="" />
                  <div className="font-semibold text-[20px]">Trust</div>
                </div>
                <p className="lg:w-[329px] pt-2 lg:pt-0 text-[14px] lg:text-[16px] lg:mt-[10px]">
                  Trust drives everything we do, built on transparency,
                  integrity, and reliability.
                </p>
              </div>
              <div className="w-full lg:hidden my-[6px] h-[1.5px] bg-[#262626]/60"></div>
              <span className="h-[130px] hidden lg:block w-[1.5px] me-10 bg-[#262626]/60"></span>
              <div>
                <div className="flex items-center gap-[10px]">
                  <img src="/images/excellence.svg" alt="" />
                  <div className="font-semibold text-[20px]">Excellence</div>
                </div>
                <p className="lg:w-[329px] pt-2 lg:pt-0 text-[14px] lg:text-[16px] lg:mt-[10px]">
                  We pursue excellence in every detail, delivering quality
                  developments and services.
                </p>
              </div>
            </div>

            <div className="w-full my-[6px] h-[1.5px] bg-[#262626]/60"></div>

            <div className="flex flex-col lg:flex-row">
              <div>
                <div className="flex items-center gap-[10px]">
                  <img src="/images/client.svg" alt="" />
                  <div className="font-semibold text-[20px]">
                    Client-Centric
                  </div>
                </div>
                <p className="lg:w-[329px] pt-2 lg:pt-0 text-[14px] lg:text-[16px] lg:mt-[10px]">
                  Your goals lead our approach as we listen, understand, and act
                  with your needs first.
                </p>
              </div>
              <div className="w-full lg:hidden my-[6px] h-[1.5px] bg-[#262626]/60"></div>
              <span className="h-[130px] hidden lg:block w-[1.5px] me-10 bg-[#262626]/60"></span>
              <div>
                <div className="flex items-center gap-[10px]">
                  <img src="/images/commitment.svg" alt="" />
                  <div className="font-semibold text-[20px]">
                    Our Commitment
                  </div>
                </div>
                <p className="lg:w-[329px] pt-2 lg:pt-0 text-[14px] lg:text-[16px] lg:mt-[10px]">
                  Exceptional service delivered with professionalism, care, and
                  excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="my-[36px] lg:my-[70px]">
        <div className="flex flex-col text-center">
          <span className="text-[#1E4645] font-urbanist font-semibold text-[14px] lg:text-[18px]">
            ABOUT US
          </span>
          <span className="font-brushelva text-[24px] lg:text-[60px] mt-[8px] lg:mt-[10px]">
            Our vision and Mission
          </span>
        </div>

        <div className="w-[336px] lg:w-[988px] relative mt-[30px] lg:mt-[100px] lg:h-[376px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[60px] pt-[20px] pb-[20px] lg:pt-[75px] shadow-[0_-6px_18px_-4px_rgba(0,0,0,0.12),0_12px_28px_-6px_rgba(0,0,0,0.08)] rounded-3xl lg:pb-10 px-[25px] lg:px-[55px]">
            <div className="lg:w-[379px] font-urbanist">
              <div className="flex items-center gap-[8px] lg:gap-[16px]">
                <img
                  src="/images/vision.svg"
                  alt=""
                  className="h-[40px] w-[40px] lg:h-[48px] lg:w-[48px]"
                />
                <span className="text-[20px] lg:text-[24px] font-bold text-[#1A614F]">
                  Vision
                </span>
              </div>
              <div className="text-[14px] lg:mt-[8px] lg:text-[18px]">
                To create nature-centric farmlands that promote peaceful living,
                responsible growth, and long-term value while preserving nature
                for future generations
              </div>
            </div>
            <div className="w-full lg:hidden h-[1.5px] bg-[#262626]/60"></div>
            <span className="w-[1px] hidden lg:block bg-[#DDFF7E]"></span>
            <div className="lg:w-[379px] font-urbanist">
              <div className="flex items-center gap-[8px] lg:gap-[16px]">
                <img
                  src="/images/mission.svg"
                  alt=""
                  className="h-[40px] w-[40px] lg:h-[48px] lg:w-[48px]"
                />
                <span className="text-[20px] lg:text-[24px] font-bold text-[#1A614F]">
                  Mission
                </span>
              </div>
              <div className="text-[14px] lg:mt-[8px] lg:text-[18px]">
                To create well-planned farmland near Bangalore with sustainable
                development, transparent ownership, and excellent connectivity
                offering a secure and meaningful land investment experience.
              </div>
            </div>
          </div>

          <div className="flex justify-center absolute z-10 -top-14 left-20">
            <div className="bg-[#1A614F] hidden px-4 gap-[60px] lg:flex font-urbanist w-[826px] h-[102px] rounded-3xl mx-auto">
              {[
                { src: "/images/about_1.svg", label: "Sustainable Living" },
                { src: "/images/about_2.svg", label: "Long-Term Value" },
                { src: "/images/about_3.svg", label: "Transparent Ownership" },
                { src: "/images/about_4.svg", label: "Nature-First Planning" },
              ].map(({ src, label }) => (
                <div
                  key={label}
                  className="py-3 flex flex-col items-center text-center"
                >
                  <img src={src} />
                  <p className="text-white pt-1 text-[16px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Novara Experience Steps */}
      <div className="h-[1753px] w-full max-w-[390px] mx-auto py-[40px] px-[8px] lg:max-w-none lg:w-full lg:px-[80px] lg:py-[80px] lg:h-[1020px] bg-[#1F5C57] overflow-x-hidden">
        <img src="/images/sparkle_3.svg" alt="sparkle" />
        <div className="pt-[6px] px-3 font-urbanist">
          <div className="font-brushelva text-white text-[28px] lg:text-[38px]">
            Navigating the Novara Experience
          </div>
          <p className="text-[#CFCACA] pt-[10px] w-full max-w-[357px] lg:max-w-[950px] text-[14px] lg:text-[16px]">
            At Novara Nature Estate, we follow a simple and transparent process
            to help you own farmland with confidence. Here's how we guide you at
            every step.
          </p>

          <div className="py-[30px] lg:pt-[60px] lg:pb-[90px] font-urbanist">
            {[
              [
                {
                  step: "Step 01",
                  title: "Explore the Farmland Options",
                  desc: "Discover thoughtfully planned farmlands near Bangalore, designed for sustainable living, long-term value, and easy accessibility.",
                },
                {
                  step: "Step 02",
                  title: "Choose the Right Plot",
                  desc: "Shortlist plots based on location, soil quality, water availability, and future growth potential guided by our expert team.",
                },
                {
                  step: "Step 03",
                  title: "Expert Guidance",
                  desc: "Have questions? Our farmland specialists assist you with legal clarity, investment insights, and project details at every stage.",
                },
              ],
              [
                {
                  step: "Step 04",
                  title: "Visit the Site",
                  desc: "Experience the land in person. We arrange site visits so you can see the location, surroundings, and development firsthand.",
                },
                {
                  step: "Step 05",
                  title: "Make an Informed Decision",
                  desc: "We support you with transparent documentation, legal verification, and clear pricing so you invest with complete confidence.",
                },
                {
                  step: "Step 06",
                  title: "Secure Your Farmland",
                  desc: "From booking to registration, we ensure a smooth, hassle-free process to help you own your farmland with ease.",
                },
              ],
            ].map((row, rowIdx) => (
              <div
                key={rowIdx}
                className={`flex flex-col ${rowIdx > 0 ? "mt-[20px] lg:mt-[40px]" : ""} gap-[20px] lg:gap-10 lg:flex-row`}
              >
                {row.map(({ step, title, desc }) => (
                  <div key={step}>
                    <div className="text-[#FFBA00] h-[52px] flex items-center text-[16px] border-l-2 border-[#FFCE4C] ps-4">
                      {step}
                    </div>
                    <div className="border-2 border-[#62A77F] rounded-tr-xl rounded-br-xl rounded-bl-xl p-[30px] lg:p-[40px] bg-gradient-to-br from-[#6FAE9E] via-[#3C7F75]/40 to-[#D5FFE6]/0 w-full max-w-[357px] h-[164px] lg:max-w-[413px] lg:h-[198px]">
                      <div className="text-white text-[18px] lg:text-[20px]">
                        {title}
                      </div>
                      <p className="text-[14px] lg:text-[16px] text-[#CFCACA] pt-[16px]">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp + Call */}
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

      <CTAStrip
        title="Ready Farmland for Immediate Ownership"
        description="Fully developed farmland with clear titles and professional management ready for immediate ownership, peaceful living."
        ctaText="Get Started"
      />
      <Chatbot />
      <Footer />
    </div>
  );
}
