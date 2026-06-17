import { motion } from "framer-motion";
import { BackgroundBeams } from "./ui/background-beams";

export default function OurStorySection() {
  return (
    <section className="relative min-h-[520px] md:min-h-[420px] overflow-hidden bg-[#1f6b57]">
      <BackgroundBeams className="z-0" />
      <div className="relative z-10 mx-auto max-w-7xl px-3 py-10 lg:py-[90px]">
        <div className="grid items-center md:grid-cols-2">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-[28px] leading-[1.05] text-[#FFCE4C] md:text-[60px] font-brushelva">
              Our Story
            </h2>

            <p className="mt-[20px] max-w-[520px] text-[15px] font-urbanist lg:text-[18px] leading-7 text-white/85">
              At Novara Nature Estates, we craft exclusive managed farmlands
              near Bangalore North, conceived for those who value legacy,
              sustainability, and enduring land ownership. The development
              reflects a deep respect for nature, paired with precise planning
              and long-term vision. Drawing from decades of real estate
              expertise, we curate farmland communities with clear titles,
              refined infrastructure, and exceptional location advantages
              offering a balance of serenity, accessibility, and lasting
              significance.
            </p>

            <p className="mt-2 max-w-[520px] text-[15px] font-urbanist lg:text-[18px] leading-7 text-white/85">
              Our signature development, Ecovara Farmplot, exemplifies this
              philosophy. Located just 10 minutes from the historic Lepakshi
              Temple, with seamless connectivity to Bangalore International
              Airport and the Bangalore-Hyderabad National Highway, Ecovara
              presents a distinguished opportunity to own land that is both
              strategically placed and naturally elevated designed for those who
              think beyond the present, toward a greener and more prosperous
              legacy
            </p>

            <div className="mt-4">
              <a
                href="/whynovara"
                className="text-white no-underline px-3 py-2 bg-[#d19800] border-1 rounded-full border-yellow-300 lg:mt-[20px]"
              >
                Know More
              </a>
            </div>
          </motion.div>

          {/* Right image collage (hidden on mobile) */}
          <motion.div
            className="relative hidden mb-32 md:block"
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative ml-auto h-[420px] w-[520px]">
              <motion.div
                className="absolute left-[0px] top-[105px] h-[350px] w-[180px] overflow-hidden rounded-[34px] bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
                initial={{ y: 10 }} whileInView={{ y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <img src="/images/3_11zon.webp" alt="farmland near bangalore" className="h-full w-full object-cover" draggable="false" />
              </motion.div>

              <motion.div
                className="absolute left-[200px] top-[35px] h-[478px] w-[180px] overflow-hidden rounded-[34px] bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
                initial={{ y: 12 }} whileInView={{ y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
              >
                <img src="/images/2_11zon.webp" alt="farmland near lepakshi" className="h-full w-full object-cover" draggable="false" />
              </motion.div>

              <motion.div
                className="absolute left-[400px] top-[100px] h-[350px] w-[180px] overflow-hidden rounded-[34px] bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
                initial={{ y: 14 }} whileInView={{ y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.85, ease: "easeOut", delay: 0.1 }}
              >
                <img src="/images/1_11zon.webp" alt="farmland investment" className="h-full w-full object-cover" draggable="false" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}