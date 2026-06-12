import Header from "../components/Header";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import EcovaraPhotoGallery from "../components/EcovaraPhotoGallery";
import EcovaraInquiryForm from "../components/EcovaraInquiryForm";
import CTAStrip from "../components/CTAStrip";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import ClientFAQ from "../components/ClientFAQ";
import BrochureModal from "../components/BrochureModal";
import FloatingCT from "../components/FloatingCT";
import WhatsAppPopup from "../components/WatsappPopup";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const smoothSpring = { type: "spring", stiffness: 80, damping: 18, mass: 0.9 };

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const DEFAULT_IMAGES = [
  { src: "/images/default_1.webp", alt: "Pool & Villa" },
  { src: "/images/default_2.webp", alt: "Forest Cottage" },
  { src: "/images/default_3.webp", alt: "Sunset View" },
  { src: "/images/default_1.webp", alt: "Pool & Villa" },
  { src: "/images/default_2.webp", alt: "Forest Cottage" },
  { src: "/images/default_3.webp", alt: "Sunset View" },
];

const amenitiesCards = [
  {
    id: 1,
    imgSrc: "/images/tree.svg",
    title: "64+ Tree Plantation",
    description:
      "A rich plantation of over 64 varieties of trees, enhancing greenery, biodiversity, and long-term land value.",
  },
  {
    id: 2,
    imgSrc: "/images/lotus.svg",
    title: "Lotus Pond / Fish Pond",
    description:
      "A serene water feature that enhances natural beauty, promotes calm surroundings, and adds to the peaceful living experience.",
  },
  {
    id: 3,
    imgSrc: "/images/fire.svg",
    title: "Campfire / Rain Dance Area",
    description:
      "Enjoy relaxing campfire evenings and fun rain dance moments perfect for leisure, celebrations, and memorable weekends.",
  },
];

const amenitiesCarded = [
  {
    id: 4,
    imgSrc: "/images/security.svg",
    title: "24/7 Security Check",
    description:
      "Round-the-clock security with controlled access to ensure a safe, secure, and worry-free environment at all times.",
  },
  {
    id: 5,
    imgSrc: "/images/solar.svg",
    title: "Solar Street Lights",
    description:
      "Eco-friendly solar street lighting that ensures safe pathways while supporting sustainable and energy-efficient living.",
  },
  {
    id: 6,
    imgSrc: "/images/cafeteria.svg",
    title: "Cafeteria",
    description:
      "A cozy cafeteria offering a relaxed space to enjoy refreshments and spend quality time with family and visitors.",
  },
];

const amenitiesCard = [
  {
    id: 1,
    imgSrc: "/images/track.svg",
    title: "Jogging Track & Pet Route",
    description:
      "A dedicated pathway for jogging and pet walks, surrounded by greenery perfect for fitness, relaxation.",
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

const specRows = [
  [
    {
      icon: "/images/spacious.svg",
      title: "Spacious Plot Dimensions",
      desc: "Well-designed plot sizes that give you ample space to build, grow, and enjoy open, green surroundings.",
    },
    {
      icon: "/images/farmland.svg",
      title: "European-Style Farmland",
      desc: "Elegant European-style planning that blends scenic charm with modern farmland living.",
    },
  ],
  [
    {
      icon: "/images/fruit.svg",
      title: "Fruit-Bearing Plantation",
      desc: "A rich mix of fruit-bearing trees that enhances greenery, supports sustainability, and adds long-term value.",
    },
    {
      icon: "/images/organic.svg",
      title: "Organic Garden Space",
      desc: "Dedicated areas for organic gardening, encouraging healthy living and a closer connection with nature.",
    },
  ],
];

const configData = [
  { sba: "6,000 Sq.Ft" },
  { sba: "8,000 Sq.Ft" },
  { sba: "10,000 Sq.Ft" },
];

const faqData = [
  {
    id: 1,
    question: "What is Ecovara by Novara Nature Estates?",
    answer:
      "Ecovara is a premium gated farmland project offering legally clear agricultural land near Bangalore, designed for secure ownership, weekend retreats, and long-term farmland investment.",
  },
  {
    id: 2,
    question: "Where is the Ecovara project located?",
    answer:
      "Ecovara offers farm plots near Lepakshi, strategically positioned within the North Bangalore growth corridor. The location provides peaceful natural surroundings while remaining well connected to Bangalore and the airport region.",
  },
  {
    id: 3,
    question: "Is Ecovara a gated farmland community?",
    answer:
      "Yes, Ecovara is a planned gated farmland project near Bangalore with secure entry, compound fencing, internal roads, and structured layout development.",
  },
  {
    id: 4,
    question: "Is Ecovara suitable for farmland investment near Bangalore?",
    answer:
      "Yes. Due to its location advantage and increasing demand for farm plots near Bangalore, Ecovara presents strong long-term appreciation potential.",
  },
  {
    id: 5,
    question: "Can I build a farmhouse on my plot?",
    answer:
      "Yes, buyers can develop private farmhouses on their agricultural land near Lepakshi, subject to applicable local regulations.",
  },
  {
    id: 6,
    question: "Is the land legally verified and ready for registration?",
    answer:
      "All plots come with legally verified documentation and are ready for registration, ensuring safe agricultural land investment.",
  },
  {
    id: 7,
    question: "How can I book a site visit for Ecovara farm plots?",
    answer:
      "You can schedule a guided site visit by contacting our team through the enquiry form or by calling our sales representatives directly.",
  },
];

// ── Page component ────────────────────────────────────────────────────────────
export default function Projects() {
  const slides = useMemo(() => DEFAULT_IMAGES, []);

  // Duplicate slides for infinite loop: [original + clone]
  const LOOPED_SLIDES = useMemo(() => [...slides, ...slides], [slides]);

  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);
  const cardRef = useRef(null);
  const [step, setStep] = useState(0);
   const [isModalOpen, setIsModalOpen] = useState(false);
const [whatsappTrigger, setWhatsappTrigger] = useState(false);
const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
const [hasWhatsAppAutoOpened, setHasWhatsAppAutoOpened] = useState(false);


  const goNext = () => {
    setAnimated(true);
    setIndex((i) => i + 1);
  };

  const goPrev = () => {
    setAnimated(true);
    setIndex((i) => i - 1);
  };

  // When index goes past the original set, silently snap back

  useEffect(() => {
    if (index >= slides.length) {
      const t = setTimeout(() => {
        setAnimated(false);
        setIndex((i) => i - slides.length);
      }, 450); // wait for spring to finish
      return () => clearTimeout(t);
    }
    if (index < 0) {
      const t = setTimeout(() => {
        setAnimated(false);
        setIndex((i) => i + slides.length);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [index, slides.length]);

  // Re-enable animation after the silent jump
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  // ── ResizeObserver — client only ─────────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      setStep(w + 24);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  return (
    <div className="font-urbanist">
      <Header />
      <motion.div // hero section
        initial="hidden"
        animate="show"
        variants={staggerWrap}
        className="h-[300px] px-2 lg:h-[400px] flex flex-col items-center justify-center relative"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/project.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/35" />

      

        <motion.div
          variants={fadeUp}
          className="relative z-10 text-center text-white font-brushelva lg:w-[1070px]"
        >
          <h1 className="text-[30px] lg:text-[50px] sm:text-[32px]">
          Ecovara - Premium Managed Farmland for Sale Near Lepakshi
          </h1>
        </motion.div>
      </motion.div>

      {/* ── Ecovara Intro ────────────────────────────────────────────────── */}
      <div className="h-[1155px] lg:h-[1024px] bg-gradient-to-b from-[#D3FFE5] to-[#FEFFFF]">
        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[67px] px-[16px] pt-[51px] lg:px-[100px] lg:pt-[101px]">
          <div>
            <img
              src="/images/Farm_11zon.webp"
              alt="Ecovara"
              className="w-[358px] h-[334px] lg:w-[563px] lg:h-[540px]"
            />
          </div>
          <div className="lg:w-[610px]">
            <img src="/images/project_icon.svg" alt="" />
            <h2 className="font-brushelva text-[25px] lg:text-[42px] text-[#000000]"> About Ecovara Premium Farmland Project Near Lepakshi 
            </h2>
            <p className="text-[16px] lg:text-[18px] font-urbanist pt-[14px]">
              Strategic Location, Promising Returns Ecovara by Novara Nature
              Estates is strategically situated near prominent IT hubs and
              industrial corridors – blending the tranquility of countryside
              living with the convenience of urban access.
            </p>
            <p className="text-[16px] lg:text-[18px] font-urbanist">
              Inspired By Nature, Perfect For Your Weekend Home.{" "}
              <strong>
                Situated Near The Historic Lepakshi Temple Along
                Bengaluru-Hyderabad National Highway
              </strong>
              , Novara Nature Estates Is A Gated Community Where Free-Spirited
              Design Blends Seamlessly With Modern Living.
            </p>
            <p>
              <strong>Spread Across 15 Acres</strong>, This Serene Retreat
              Offers A Harmonious Mix Of Rustic Charm And Contemporary Comforts.
              Whether You're Looking For A Peaceful Weekend Escape Or A Larger
              Plot For Farming, Our Flexible Unit Sizes –{" "}
              <strong>Starting From 6,000 Sqft Onwards</strong>, Cater To Your
              Unique Needs.
            </p>
          </div>
        </div>

        {/* Image Carousel (infinite loop)  */}
        <div className="relative mx-auto w-[358px] mt-[36px] lg:w-[1300px] lg:mt-[36px] overflow-visible">
          <div className="relative overflow-hidden">
            <motion.div
              className="flex items-stretch gap-2 lg:gap-6"
              animate={{ x: step ? -index * step : 0 }}
              transition={
                animated
                  ? { type: "spring", stiffness: 140, damping: 20 }
                  : { duration: 0 } // instant silent snap — invisible to user
              }
            >
              {LOOPED_SLIDES.map((img, i) => (
                <motion.div
                  key={`${img.src}-${i}`}
                  ref={i === 0 ? cardRef : null}
                  className="relative shrink-0 w-[140px] h-[100px] lg:h-full sm:w-[640px] md:w-[600px] lg:w-[360px] xl:w-[380px] 2xl:w-[400px]"
                >
                  <div className="relative overflow-hidden rounded-[15px] lg:rounded-[34px] bg-transparent">
                    <div className="aspect-[16/9] w-full lg:aspect-[16/10]">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-[100px] w-[148px] lg:h-full lg:w-full object-cover"
                        draggable={false}
                        loading="lazy"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-[-1px] top-1/2 z-10 -translate-y-1/2 lg:left-[-25px] rounded-full bg-[#0F6A49] p-[2px] lg:p-2 text-white transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ChevronLeft className="h-5 w-5 lg:h-8 lg:w-8" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-[-1px] top-1/2 z-10 -translate-y-1/2 lg:right-[-30px] rounded-full bg-[#0F6A49] p-[2px] lg:p-2 text-white transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ChevronRight className="h-5 w-5 lg:h-8 lg:w-8" />
          </button>
        </div>
      </div>

      {/* ── Specifications ───────────────────────────────────────────────── */}
      <div
        className="bg-no-repeat bg-cover bg-center flex flex-col lg:flex-row justify-center items-center py-[40px] p-3 lg:p-0 gap-[8px] lg:gap-[20px] lg:h-[577px]"
        style={{ backgroundImage: "url('/images/specification.webp')" }}
      >
        <div className="lg:w-[413px]">
          <img src="/images/updated_icon.svg" alt="sparkle" />
          <div className="font-brushelva text-[#FFD871] text-[28px] lg:text-[38px]">
            Specification of the Ecovara Plot
          </div>
          <p className="text-[14px] lg:text-[16px] font-urbanist text-white">
            Our story is one of continuous growth and evolution. We started as a
            small team with big dreams, determined to create a real estate
            platform that transcended the ordinary.
          </p>
        </div>
        <div className="bg-white font-urbanist p-[20px] lg:p-[40px] lg:w-[807px] lg:h-[444px] rounded-xl">
          {specRows.map((row, rowIdx) => (
            <div key={rowIdx}>
              {rowIdx > 0 && (
                <div className="w-full my-[14px] h-[1.5px] bg-[#262626]/60" />
              )}
              <div className="flex flex-col lg:flex-row">
                {row.map(({ icon, title, desc }, colIdx) => (
                  <div key={title} className="flex items-stretch">
                    {/* Vertical divider — desktop only, between columns */}
                    {colIdx > 0 && (
                      <span className="hidden lg:block w-[2px] mx-4 bg-[#262626]/60 self-stretch" />
                    )}

                    {/* Horizontal divider — mobile only, between stacked items */}
                    <div className="flex flex-col w-full">
                      {colIdx > 0 && (
                        <div className="w-full mb-[14px] h-[1.5px] bg-[#262626]/60 lg:hidden" />
                      )}
                      <div className="flex items-center gap-[10px]">
                        <img src={icon} alt="" />
                        <div className="font-semibold text-[18px] lg:text-[20px]">
                          {title}
                        </div>
                      </div>
                      <p className="lg:w-[329px] mt-2 text-[14px] lg:text-[16px]">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Project Highlights ───────────────────────────────────────────── */}
      <div
        className="w-full max-w-[390px] mx-auto lg:max-w-none lg:w-full lg:h-[1090px] px-[16px] sm:px-[32px] py-[40px] lg:px-[120px] lg:py-[89px] bg-cover bg-center bg-no-repeat overflow-x-hidden"
        style={{ backgroundImage: "url('/images/amenities_bg.webp')" }}
      >
        <div className="text-[#FFD972] text-[28px] lg:text-[50px] font-brushelva">
          Project Highlights
        </div>
        <p className="text-white text-[14px] lg:text-[16px] mt-3 w-full lg:max-w-[1300px] font-urbanist">
          Selling your property should be a rewarding experience, and at
          Estatein, we make sure it is. Our Property Selling Service is designed
          to maximize the value of your property, ensuring you get the best deal
          possible. Explore the categories below to see how we can help you at
          every step of your selling journey.
        </p>

        {[amenitiesCards, amenitiesCarded].map((cards, idx) => (
          <div key={idx} className="flex flex-col lg:flex-row gap-[16px] mt-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white font-urbanist lg:w-[413.33px] p-[24px] rounded-3xl lg:h-[236px] lg:p-[40px]"
              >
                <div className="flex items-center">
                  <img src={card.imgSrc} alt="" />
                  <div className="ps-3 lg:text-[20px] text-[#1A614F] font-semibold">
                    {card.title}
                  </div>
                </div>
                <div className="mt-[18px] text-[14px] lg:text-[16px]">
                  {card.description}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="flex flex-col lg:flex-row gap-[16px] mt-[16px]">
          {amenitiesCard.map((card) => (
            <div
              key={card.id}
              className="bg-white font-urbanist lg:w-[413.33px] p-[24px] rounded-3xl lg:h-[236px] lg:p-[40px]"
            >
              <div className="flex items-center">
                <img src={card.imgSrc} alt="" />
                <div className="ps-1 text-[18px] lg:text-[20px] text-[#1A614F] font-semibold">
                  {card.title}
                </div>
              </div>
              <div className="mt-[18px] text-[14px] lg:text-[16px]">
                {card.description}
              </div>
            </div>
          ))}

          <div
            style={{ backgroundImage: "url('/images/cta_background.webp')" }}
            className="bg-no-repeat bg-center bg-cover text-white font-urbanist w-full lg:w-[847px] rounded-3xl py-[24px] px-[24px] lg:h-[236px] lg:py-[60px] lg:p-[40px]"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="order-1 lg:flex-1 lg:mr-6">
                <div className="text-[20px] lg:text-[24px] font-bold">
                  Unlock the Value of Your Property Today
                </div>
                <div className="mt-[10px] text-[#E2DFDF] lg:text-[16px] lg:max-w-[600px]">
                  Ready to unlock the true value of your property? Explore our
                  Property Selling Service categories and let us help you
                  achieve the best deal possible for your valuable asset.
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="order-2 mt-[20px] lg:mt-0 lg:flex-shrink-0 bg-[#DCA000] text-center no-underline rounded-lg border border-[#FFCE4C] text-[14px] px-[20px] py-[14px] lg:px-[40px] text-white w-full lg:w-auto hover:bg-[#E3A600] transition"
              >
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
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

      <EcovaraPhotoGallery
        titleTop="Location"
        titleLine1="NEARBY"
        titleLine2="ATTRACTIONS"
        badgeIconSrc="/images/sparkle.svg"
      />

      {/* ── Configurations ───────────────────────────────────────────────── */}
      <div
        className="lg:w-full h-[285px] lg:h-[508px] flex flex-col justify-center items-center"
        style={{ backgroundImage: "url('/images/configure.png')" }}
      >
        <div className="font-brushelva text-[24px] lg:text-[60px] text-white text-center">
          Configurations
        </div>
        <div className="w-[320px] lg:w-[766px] rounded-[16px] border-2 lg:mt-6 mt-3 border-[#FFEAB3]">
          <div className="rounded-2xl overflow-hidden font-urbanist">
            <div className="bg-[#DCA000] grid grid-cols-2 text-white font-semibold text-[18px] lg:text-[20px]">
              <div className="py-[8px] px-2 lg:px-6 lg:py-4 text-center">
                SBA (Sq.Ft)
              </div>
              <div className="py-[8px] px-2 lg:px-6 lg:py-4 text-center">
                Price
              </div>
            </div>
            {configData.map((row, idx) => (
              <div
                key={idx}
                className="flex flex-row justify-around border-t border-[#FFEAB3]"
              >
                <div className="px-2 py-[8px] lg:px-6 lg:py-[20px] text-white text-center font-medium">
                  {row.sba}
                </div>
                <div className="px-2 py-[8px] lg:py-[20px] flex items-center justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 text-[#DCA000] font-medium hover:text-[#F4B000] transition-colors"
                  >
                    <img src="/images/lock.svg" alt="locked" />
                    <span>Unlock Price</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EcovaraInquiryForm />
      <ClientFAQ faqs={faqData} />

      <div className="bg-yellow-50">
        <CTAStrip
          title="Move-In Ready Managed Farmland"
          description="Fully developed managed farmlands offering easy ownership, modern infrastructure, and peaceful nature living perfect for weekend stays or long-term investment."
          ctaText="Get Started"
        />
      </div>

      {/* ── Shared components ────────────────────────────────────────────── */}
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
