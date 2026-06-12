// pages/index/+Page.jsx
import Header from "../components/Header";
import { motion } from "framer-motion";
import OurStorySection from "../components/OurStorySection";
import EcovaraHeroBlock from "../components/EcovaraHeroBlock";
import EcovaraPhotoGallery from "../components/EcovaraPhotoGallery";
import FarmlandSmartChoiceSection from "../components/FarmlandSmartChoiceSection";
import CTAStrip from "../components/CTAStrip";
import { BLOGS } from "../data/blogs";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import Chatbot from "../components/Chatbot";
import { ClientTestimonials } from "../components/Clienttestimonials";
import ClientFAQ from "../components/ClientFAQ";
import { navigate } from "vike/client/router"; // ✅ Vike navigation (replaces useNavigate)
import FloatingCT from "../components/FloatingCT";
import BrochureModal from "../components/BrochureModal";
import WhatsAppPopup from "../components/WatsappPopup";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://novara-backend-one.vercel.app";

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


// ✅ Vike requires a named or default export — both work
export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
const [whatsappTrigger, setWhatsappTrigger] = useState(false);
const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
const [hasWhatsAppAutoOpened, setHasWhatsAppAutoOpened] = useState(false);
const [modalVariant, setModalVariant] = useState("brochure");

useEffect(() => {
  const timer = setTimeout(() => {
    if (!hasWhatsAppAutoOpened) {
      setIsWhatsAppOpen(true);
      setHasWhatsAppAutoOpened(true);
    }
  }, 5000);
  return () => clearTimeout(timer);
}, [hasWhatsAppAutoOpened]);

   useEffect(() => {
    const timer = setTimeout(() => setIsModalOpen(true), 25000);
    return () => clearTimeout(timer);
  }, []);
  const amenitiesCard = [
    {
      id: 1,
      imgSrc: "/images/organic_icon.svg",
      title: "Organic Farming",
      description:
        "Dedicated space for organic farming, allowing you to grow healthy, chemical-free produce naturally.",
    },
  ];

  const destinations = [
    { name: "Lepakshi Temple", time: "10 Mins" },
    { name: "Hindupuram Town", time: "10 Mins" },
    { name: "Bagepalli Toll Plaza", time: "20 Mins" },
    { name: "Penukonda Fort", time: "30 Mins" },
    { name: "Isha Foundation", time: "50 Mins" },
    { name: "Nandhi Hills", time: "60 Mins" },
    { name: "Devanahalli", time: "65 Mins" },
    { name: "KIA Airport Devanahalli", time: "75 Mins" },
  ];

  const amenitiesCards = [
    {
      id: 1,
      imgSrc: "/images/club_house_icon.svg",
      title: "Clubhouse",
      description:
        "An exclusive clubhouse offering comfortable spaces for leisure, events, and social interaction.",
    },
    {
      id: 2,
      imgSrc: "/images/kids_play_icon.svg",
      title: "Kids Play Area",
      description:
        "A safe and fun play area designed for children to enjoy outdoor activities in a secure, natural environment.",
    },
    {
      id: 3,
      imgSrc: "/images/swimming_icon.svg",
      title: "Swimming Pool",
      description:
        "Enjoy a refreshing swim in a well-designed pool that adds comfort, leisure, and a resort-style feel.",
    },
  ];

  const latestBlogs = BLOGS.slice(0, 3);
  

  return (
    <div className="font-urbanist">
      <Header />
        {/* <BrochureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
      {/* HERO */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="h-[400px] px-2 lg:h-[600px] flex flex-col items-center justify-center relative overflow-hidden"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero_video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/35"></div>

        <motion.div
          variants={fadeUp}
          className="relative z-10 text-center text-white font-brushelva lg:w-[1200px]"
        >
          <h1 className="text-[22px] sm:text-[32px] lg:text-[64px]">
            Premium Managed Farmland Near North Bangalore With Novara Nature Estates
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="relative z-10 text-center font-urbanist text-white/80 text-[14px] lg:w-[850px] sm:text-[14px] mt-[10px] lg:mt-[20px] lg:text-[24px]"
        >
          Discover managed farmlands near Bangalore North with clear titles,
          prime locations, and expert management.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="relative z-10 mt-[20px] lg:mt-[40px] flex justify-center"
        >
          {/* ✅ Plain <a> replaces <Link> */}
          <a
            href="/contactus"
            className="w-[200px] h-[50px] sm:w-[200px] sm:h-[60px] inline-flex items-center justify-center rounded-full px-4 py-3 sm:px-5 sm:py-4 text-[14px] sm:text-[16px] lg:text-[18px] font-urbanist font-semibold shadow-lg bg-[#DCA000] hover:bg-[#DCA000]/90 text-white no-underline transition-all duration-300 hover:scale-105"
          >
            Book a Farm Visit
          </a>
        </motion.div>
      </motion.div>

      <motion.div>
        <OurStorySection />
      </motion.div>
      <EcovaraHeroBlock />
      <EcovaraPhotoGallery />
      <FarmlandSmartChoiceSection />

      {/* Location Highlights */}
      <div
        style={{ backgroundImage: "url('/images/background.webp')" }}
        className="h-[780px] lg:h-[669px] bg-gradient-to-b from-[#D3FFE5] via-[#D3FFE5] to-[#FEFFFF]"
      >
        <div className="flex flex-col items-center justify-center gap-6 lg:gap-0 lg:relative">
          <div className="order-1 w-full px-[20px] lg:px-[80px]">
            <div className="font-brushelva pt-10">
              <img src="/images/updated_icon.svg" alt="sparkle" />
              <div className="text-[18px] lg:text-[24px] text-[#FFC62C] mt-2">Ecovara Farms</div>
              <div className="text-[38px] lg:text-[48px] text-white">Location Highlights</div>
            </div>
          </div>

          <div className="order-2 relative z-10 lg:left-64 lg:-mt-[160px]">
            <img src="/images/Map_location.webp" className="w-full max-w-[370px] lg:max-w-[940px]" alt="Location" />
          </div>

          <div className="order-3 flex items-center font-urbanist mt-[12px] lg:mt-[1px] w-[309px] h-[276px] lg:w-[400px] lg:h-[352px] justify-center lg:absolute lg:left-[80px] lg:top-[220px]">
            <div className="bg-white/80 rounded-lg shadow-lg py-2 px-3 w-full max-w-md">
              {destinations.map((destination, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto_1fr] items-center py-2 border-b border-[#D5FFE6] last:border-b-0">
                  <span className="text-[#1A614F] text-[12px] lg:text-[16px] font-medium text-left">{destination.name}</span>
                  <span className="h-5 lg:h-6 w-px ms-3 bg-[#1A614F]"></span>
                  <span className="text-[#1A614F] text-[12px] lg:text-[16px] font-bold text-right lg:pe-[80px] whitespace-nowrap">{destination.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div
        className="w-full lg:w-full lg:h-[860px] lg:px-[120px] pb-[20px] py-[16px] lg:py-[89px] bg-cover bg-center bg-no-repeat overflow-x-hidden"
        style={{ backgroundImage: "url('/images/Background 2_11zon.webp')" }}
      >
        <div className="text-[#FFD972] px-3 text-[28px] lg:text-[50px] font-brushelva">Our Amenities</div>
        <p className="text-white text-[14px] lg:text-[16px] px-3 mt-3 lg:w-[1030px] font-urbanist">
          Our managed farmlands near Bangalore offer world-class amenities designed for a sustainable lifestyle.
          Enjoy lush green landscapes, open spaces, and modern infrastructure, including well-planned roads,
          24/7 security, and reliable water supply, all ensuring a comfortable living experience with easy access to key landmarks.
        </p>

        <div className="flex flex-col lg:flex-row lg:ms-6 gap-[16px] mt-4 lg:w-[1200px]">
          {amenitiesCards.map((card) => (
            <div key={card.id} className="bg-white font-urbanist mx-auto w-full max-w-[340px] lg:max-w-[380px] rounded rounded-3 lg:h-[236px] p-[20px] lg:p-[40px]">
              <div className="flex align-items-center">
                <div><img src={card.imgSrc} alt=""/></div>
                <div className="ps-3 lg:text-[20px] text-[#1A614F] font-semibold">{card.title}</div>
              </div>
              <div className="mt-[18px] lg:w-[320px] text-[14px] lg:text-[16px]">{card.description}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-[16px] sm:ms-0 md-ms-0 lg:ms-6 lg:gap-[16px] mt-[16px] lg:mt-[20px] lg:w-[1200px]">
          {amenitiesCard.map((card) => (
            <div key={card.id} className="bg-white font-urbanist mx-auto w-full max-w-[340px] lg:max-w-[380px] rounded rounded-3 lg:h-[236px] p-[20px] lg:p-[40px]">
              <div className="flex align-items-center">
                <div><img src={card.imgSrc} alt=""/></div>
                <div className="ps-3 lg:text-[20px] text-[#1A614F] font-semibold">{card.title}</div>
              </div>
              <div className="mt-[18px] text-[14px] lg:text-[16px]">{card.description}</div>
            </div>
          ))}

          <div
            style={{ backgroundImage: "url('/images/cta_background.webp')" }}
            className="bg-no-repeat bg-center bg-cover mx-auto text-white font-urbanist w-full max-w-[340px] lg:max-w-none lg:w-[780px] rounded-3 py-[24px] px-[20px] lg:h-[236px] lg:py-[60px] lg:p-[40px]"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="order-1 lg:flex-1 lg:mr-6">
                <div className="text-[20px] lg:text-[24px] font-bold">Unlock the Value of Your Property Today</div>
                <div className="mt-[10px] text-[#E2DFDF] text-[14px] lg:text-[16px] lg:max-w-[600px]">
                  Ready to unlock the true value of your property? Explore our Property Selling Service
                  categories and let us help you achieve the best deal possible for your valuable asset.
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="order-2 lg:order-2 mt-[20px] lg:mt-0 lg:flex-shrink-0 bg-[#DCA000] text-center no-underline rounded-lg border border-[#FFCE4C] text-[14px] px-[20px] py-[14px] lg:px-[40px] text-white w-full lg:w-auto hover:bg-[#E3A600] transition"
              >
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>

      <ClientTestimonials />

      {/* Latest Blogs */}
      <div
        className="lg:h-[690px] lg:px-[100px] py-5 lg:py-[90px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/blog-bg.webp')" }}
      >
        <div className="text-[24px] lg:text-[44px] text-[#FFC62C] font-brushelva text-center">Our Latest Blogs</div>
        <div className="mt-3 flex justify-center">
          {/* ✅ Plain <a> replaces <Link> */}
          <a href="/blogs" className="no-underline font-urbanist text-[14px] font-semibold text-[#1A614F] hover:text-[#E3A600] transition">
            View all blogs →
          </a>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-5 lg:gap-[30px] mt-[24px]">
          {latestBlogs.map((blog) => (
            <div key={blog.id} className="w-[351px] h-[350px] lg:w-[400px] lg:h-[380px] rounded-[22px] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="overflow-hidden rounded-[16px]">
                {/* ✅ Plain <a> replaces <Link> */}
                <a href={`/blogs/${blog.slug}`}>
                  <img src={blog.image} alt={blog.title} className="h-[200px] w-full object-cover" />
                </a>
              </div>
              <div className="mt-3 flex font-urbanist items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-full bg-[#E9FFF3] px-3 py-1 text-[12px] font-medium text-[#1B9A63]">
                    {blog.category}
                  </span>
                  <div className="flex justify-between items-center mt-2">
                    <h3 className="text-[16px] lg:text-[20px] lg:w-[250px] font-semibold leading-snug text-[#0F172A]">
                      {blog.title}
                    </h3>
                    {/* ✅ Plain <a> replaces <Link> */}
                    <a href={`/blogs/${blog.slug}`}
                      className="flex w-[48px] ms-14 mb-4 h-[48px] shrink-0 items-center justify-center rounded-full bg-[#E3A600] text-white transition hover:scale-105">
                      <img src="/images/arrow_1.png" alt="Arrow" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <ClientFAQ />
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
  title={modalVariant === "brochure" ? "Enquire Us" : "Request a Callback"}
  description={
    modalVariant === "brochure"
      ? "Fill in your details and our team will get in touch with you shortly regarding your enquiry."
      : "Provide your details below and we’ll connect with you to assist with your enquiry."
  }
  submitLabel={modalVariant === "brochure" ? "Submit" : "Request Now"}
/>

      <div className="bg-yellow-50">
        <CTAStrip
          title="Start Managed Farming Today"
          description="Enjoy hassle-free farming with expert care, regular maintenance, and sustainable practices that help your land grow in value and productivity."
          ctaText="Book a Farm Visit"
        />
      </div>
       
      <Chatbot />
      <Footer />
    </div>
  );
}
