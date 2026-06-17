import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_IMAGES = [
  { src: "/images/kempegowda_airport.webp", alt: "Kempegowda International Airport", badgeText: "Kempegowda International Airport" },
  { src: "/images/lepakshi_temple.webp", alt: "lepakshi temple", badgeText: "Lepakshi Temple" },
  { src: "/images/gudibande_fort.webp", alt: "gudibande fort", badgeText: "Gudibande Fort" },
  { src: "/images/isha_foundation.webp", alt: "isha foundation", badgeText: "Isha Foundation" },
  { src: "/images/nandi_hills.webp", alt: "nandi hills", badgeText: "Nandi Hills" },
  { src: "/images/penukonda_fort.webp", alt: "penukonda fort", badgeText: "Penukonda Fort" },
  { src: "/images/puttaraparti_temple.webp", alt: "puttaraparti temple", badgeText: "Puttaraparti Sai Baba Temple" },
  { src: "/images/vishurashwatha.webp", alt: "vidhurashwatha temple", badgeText: "Vidhurashwatha Temple" },
];

// ── SSR-safe useLayoutEffect ──────────────────────────────────────────────────
// useLayoutEffect throws a warning on the server. We swap it for useEffect
// during SSR so Vike's pre-render doesn't complain.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function EcovaraPhotoGallery({
  images = DEFAULT_IMAGES,
  titleTop = "Location",
  titleLine1 = "Near By Attractions of",
  titleLine2 = "ECOVARA Farms",
}) {
  const slides = useMemo(
    () => (images?.length ? images : DEFAULT_IMAGES),
    [images],
  );

  const [index, setIndex] = useState(0);
  // ── Start as false so SSR renders the mobile layout (no window check on server)
  const [isDesktop, setIsDesktop] = useState(false);
  const cardRef = useRef(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Detect desktop — runs only on client
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Triple slides for infinite desktop loop
  const displaySlides = useMemo(() => {
    if (!isDesktop) return slides;
    return [...slides, ...slides, ...slides];
  }, [slides, isDesktop]);

  // Start at middle set on desktop
  useEffect(() => {
    if (isDesktop) {
      setIndex(slides.length);
    } else {
      setIndex(0);
    }
  }, [isDesktop, slides.length]);

  const clampIndex = (i) => {
    if (!isDesktop) {
      const n = slides.length;
      return ((i % n) + n) % n;
    }
    return i;
  };

  const goPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex((v) => clampIndex(v - 1));
  };

  const goNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex((v) => clampIndex(v + 1));
  };

  // ── ResizeObserver — only runs on client (useIsomorphicLayoutEffect)
  useIsomorphicLayoutEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      const gap = 24;
      setStep(w + gap);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Handle infinite loop reset on desktop
  const handleAnimationComplete = () => {
    setIsAnimating(false);
    if (!isDesktop) return;
    if (index <= 0) {
      setIndex(slides.length);
    } else if (index >= slides.length * 2) {
      setIndex(slides.length);
    }
  };

  // Keyboard support — only on client
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnimating]);

  return (
    <section className="w-full bg-gradient-to-b from-[#D3FFE5] to-[#ffff]">
      <div className="mx-auto max-w-full px-5 py-20 sm:px-8 sm:py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-14">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="flex flex-col items-center lg:items-start">
              <svg width="34" height="18" viewBox="0 0 34 18" fill="none" aria-hidden="true">
                <path d="M9 0C9.9 4.2 12.2 6.5 16.4 7.4C12.2 8.3 9.9 10.6 9 14.8C8.1 10.6 5.8 8.3 1.6 7.4C5.8 6.5 8.1 4.2 9 0Z" fill="#0F5E49" opacity="0.9" />
                <path d="M23 3C23.55 5.6 24.95 7 27.55 7.55C24.95 8.1 23.55 9.5 23 12.1C22.45 9.5 21.05 8.1 18.45 7.55C21.05 7 22.45 5.6 23 3Z" fill="#F3B300" opacity="0.95" />
                <path d="M31 6C31.35 7.7 32.25 8.6 33.95 8.95C32.25 9.3 31.35 10.2 31 11.9C30.65 10.2 29.75 9.3 28.05 8.95C29.75 8.6 30.65 7.7 31 6Z" fill="#0F5E49" opacity="0.8" />
              </svg>
              <p className="text-[14px] mt-3 sm:text-[20px] font-semibold font-urbanist tracking-[0.22em] text-[#DCA000]">
                {titleTop}
              </p>
            </div>
            <h2 className="font-brushelva lg:text-left text-[#0F5E49]">
              <div className="font-light text-2xl lg:text-[32px]">{titleLine1}</div>
              <div className="text-3xl lg:mt-2 lg:text-[45px]">{titleLine2}</div>
            </h2>
          </motion.div>

          {/* RIGHT CAROUSEL */}
          <div className="relative max-w-full overflow-visible">
            <div className="relative overflow-hidden">
              <motion.div
                className="flex items-stretch gap-6"
                animate={{ x: step ? -index * step : 0 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 20,
                  duration: isDesktop ? undefined : 0.5,
                }}
                onAnimationComplete={handleAnimationComplete}
              >
                {displaySlides.map((img, i) => (
                  <motion.div
                    key={`${img.src}-${i}`}
                    ref={i === 0 ? cardRef : null}
                    className={[
                      "relative shrink-0",
                      "w-full",
                      "sm:w-[640px] md:w-[600px]",
                      "lg:w-[360px] xl:w-[380px] 2xl:w-[400px]",
                    ].join(" ")}
                  >
                    <div className="relative overflow-hidden rounded-[34px] bg-transparent">
                      <div className="aspect-[16/9] w-full lg:aspect-[16/10]">
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="h-full w-full object-cover"
                          draggable={false}
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 left-5 font-urbanist flex justify-center items-center w-[250px] lg:w-[350px] rounded-full bg-black/60 text-white py-[4px] lg:py-[8px] px-4 text-sm lg:text-base">
                          {img.badgeText}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-[-24px] top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#0F6A49] p-2 text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-[-24px] top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#0F6A49] p-2 text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}