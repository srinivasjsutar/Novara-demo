import { useState } from "react";

const testimonials = [
  {
    name: "Fasnet",
    text: "We visited ECOVARA Farm again in the first week of February, this time as a group of five families, including seven very active kids. We saw that the model house construction is progressing well, and there is ample open farm space where the children happily engaged in various farm activities throughout the day.",
    rating: 5,
  },
  {
    name: "Shashikant Chulki",
    text: "It's very good project within the vicinity of the city limit's. With upcoming 10 way express high way Lepakshi hub this will be best amongst all project's near by. Its a good investment where returns are assured.",
    rating: 5,
  },
  {
    name: "PRASHANT SINGH",
    text: "Must recommend this farm land to all the buyers. Developer is very transparent and legal are all in place.",
    rating: 5,
  },
  {
    name: "Simba Brownie",
    text: "I recently visited the Novara Nature Estates project and was impressed with the greenery, layout planning, and long-term vision. The concept of managed farmland makes it easy even for working professionals. The team was patient and answered all our questions. Definitely a trustworthy investment option.",
    rating: 5,
  },
  {
    name: "Puneeth Reddy",
    text: "Novara Nature Estates provides a good opportunity for managed farmland investment near Bangalore. The team is supportive and explains everything clearly, from land registration to plantation management. Highly recommended.",
    rating: 5,
  },
];

const StarRating = ({ count }) => (
  <div className="flex gap-1 mb-4">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const GoogleBadge = () => (
  <a
    href="https://www.google.com/maps/place/?q=place_id:ChIJjb-Ya4lmD2wRm26K-dNVVe4"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center bg-white rounded-xl p-1.5 shadow-sm hover:shadow-md transition-shadow"
    style={{ border: "1px solid #e5e7eb" }}
    onClick={(e) => e.stopPropagation()}
  >
    <GoogleLogo />
  </a>
);

export function ClientTestimonials() {
  const [current, setCurrent] = useState(0);

  const visible = [
    testimonials[current % testimonials.length],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="relative flex flex-col items-center justify-center px-6 py-10 lg:py-20 bg-gradient-to-b from-[#D3FFE5] to-[#FEFFFF]">

      {/* Heading */}
      <div className="text-center mb-4">
        <h2
          className="text-[28px] lg:text-[48px] font-brushelva uppercase mb-6"
          style={{ color: "#1A614F", letterSpacing: "0.12em" }}
        >
          What Our Clients Say
        </h2>
        <p className="text-gray-500 text-[16px] max-w-[644px] mx-auto leading-relaxed">
          Real stories from happy investors who trusted us with their farmland journey.
        </p>
      </div>

      {/* Cards */}
      <div className="flex gap-4 lg:gap-10 lg:mt-14 w-full max-w-7xl items-center justify-center flex-wrap">
        {visible.map((t, idx) => (
          <div
            key={`${current}-${idx}`}
            className={`relative bg-white rounded-2xl pt-[20px] h-[280px] lg:h-[300px] pl-[17px] pb-[14px] pr-[10px] lg:pt-[40px] lg:pl-[32px] lg:pr-[28px] lg:pb-[26px] flex flex-col justify-between
              ${idx !== 1 ? "hidden lg:flex" : "flex"}`}
            style={{
              width: "380px",
              boxShadow:
                idx === 1
                  ? "0 20px 60px rgba(0,0,0,0.12)"
                  : "0 4px 20px rgba(0,0,0,0.0)",
            }}
          >
            {/* Google Badge — top right corner of card */}
            <div className="absolute top-3 right-3">
              <GoogleBadge />
            </div>

            <div>
              <StarRating count={t.rating} />
              <p
                className="text-sm text-[16px] font-urbanist"
                style={{ color: "#374151", lineHeight: "20px" }}
              >
                {t.text.split(" ").map((word, i) => (
                  <span key={i}>{word} </span>
                ))}
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-gray-900">{t.name}</span>
              <span className="text-[10px] text-gray-400">{t.title}</span>
            </div>
          </div>
        ))}
      </div>
      {/* View More Reviews Button */}
      <div className="mt-8 flex justify-center">
        <a
          href="https://www.google.com/maps/place/Novara+Nature+Estates+-+Managed+Farmlands/@13.0623637,77.5886113,17z/data=!4m8!3m7!1s0x6c0f66896b98bf8d:0xee5555d3f98a6e9b!8m2!3d13.0623637!4d77.5886113!9m1!1b1!16s%2Fg%2F11y_v5mfjs?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all hover:shadow-lg active:scale-95"
          style={{
            background: "#ffffff",
            color: "#1a5c44",
            border: "1.5px solid #1a5c44",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1a5c44";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.color = "#1a5c44";
          }}
        >
          <GoogleLogo />
          View More Reviews
        </a>
      </div>

      {/* Navigation Toggle */}
      <div className="mt-6 flex items-center">
        <div
          className="flex items-center rounded-full p-1.5 gap-2 cursor-pointer"
          style={{ background: "#1a5c44", width: "108px", height: "52px" }}
        >
          <button
            onClick={prev}
            className="group w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white active:scale-95"
            aria-label="Previous"
          >
            <img src="/images/clientprev.svg" alt="" className="block group-hover:hidden" />
            <img src="/images/clientprevhover.svg" alt="" className="hidden group-hover:block" />
          </button>
          <button
            onClick={next}
            className="group w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white active:scale-95"
            aria-label="Next"
          >
            <img src="/images/clientnext.svg" alt="" className="block group-hover:hidden" />
            <img src="/images/clientnexthover.svg" alt="" className="hidden group-hover:block" />
          </button>
        </div>
      </div>

      

    </section>
  );
}
