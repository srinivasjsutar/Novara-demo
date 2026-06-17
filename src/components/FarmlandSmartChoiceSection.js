import { motion } from "framer-motion";

export default function FarmlandSmartChoiceSection({
  bgImage = "/images/background_11.webp",
}) {
  return (
    <section className="relative w-full lg:h-[798px] overflow-hidden">
      <img
        src={bgImage}
        alt="Farmland background"
        className="absolute inset-0 h-full w-full object-cover"
        draggable="false"
      />
      <div className="relative mx-auto w-full lg:w-[1280px] lg:h-[526px] px-[12px] py-10 sm:px-8 sm:py-14 lg:py-[120px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-10">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-white"
          >
            <h2 className="w-full max-w-[340px] lg:max-w-[456px] font-brushelva text-[28px] leading-tight text-[#FFD972] lg:text-[38px] lg:leading-relaxed">
              Why Investing in Our Farmland is a Smart Choice
            </h2>

            <p className="mt-4 w-full max-w-[340px] lg:max-w-[456px] text-[14px] leading-6 text-white/90 lg:text-[16px]">
              Our farmlands offer a smart, eco-friendly investment with strong
              long-term growth, prime locations, and rising value perfect for
              both personal use and future returns.
            </p>

            {/* CTA Card */}
            <div
              style={{ backgroundImage: "url('/images/why_investing.webp')" }}
              className="bg-no-repeat bg-center bg-cover mt-6 w-full max-w-[340px] mx-auto lg:mx-0 lg:max-w-[483px] h-[260px] rounded-2xl bg-[#1E6B54] p-[24px] lg:p-[40px] shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
            >
              <h3 className="text-[20px] lg:text-[22px] w-full lg:w-[403px] font-urbanist font-semibold text-white">
                Unlock Your Property Investment Growth
              </h3>

              <p className="mt-[20px] text-[14px] lg:text-[16px] w-full lg:w-[390px] font-urbanist leading-6 text-white/85">
                Explore our comprehensive Property Management Services, designed
                to take the complexity out of property ownership.
              </p>

              <a
                href="/projects"
                className="
                  mt-2 block w-full text-center font-urbanist no-underline
                  rounded-xl bg-[#DCA000] border-2 border-[#FFCE4C]
                  px-5 py-3 text-sm font-semibold text-white
                  transition hover:brightness-95 active:brightness-90
                "
              >
                LEARN MORE
              </a>
            </div>
          </motion.div>

          {/* RIGHT: Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          >
            <div className="flex flex-col lg:flex-row mt-3 gap-[16px]">
              <div className="bg-white mx-auto font-urbanist max-w-[340px] lg:w-[358px] rounded rounded-3 h-[175px] lg:h-[236px] p-[20px] lg:p-[40px]">
                <div className="flex align-items-center">
                  <img src="/images/long_term.svg" alt=""/>
                  <div className="ps-3 text-[18px] lg:text-[20px] text-[#1A614F] font-semibold">
                    Long-Term Growth
                  </div>
                </div>
                <div className="mt-[24px] text-[14px] lg:text-[16px]">
                  Our farmlands offer consistent growth and long-term value,
                  making them a solid investment for the future.
                </div>
              </div>
              <div className="bg-white mx-auto font-urbanist max-w-[340px] lg:w-[358px] rounded rounded-3 h-[175px] lg:h-[236px] p-[20px] lg:p-[40px]">
                <div className="flex align-items-center">
                  <img src="/images/prime_location.svg" alt=""/>
                  <div className="ps-3 text-[18px] lg:text-[20px] text-[#1A614F] font-semibold">
                    Prime Locations
                  </div>
                </div>
                <div className="mt-[24px] text-[14px] lg:text-[16px]">
                  Our farmlands are in desirable locations, ensuring optimal
                  returns and a secure investment.
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-[16px] mt-4">
              <div className="bg-white mx-auto font-urbanist max-w-[340px] lg:w-[358px] rounded rounded-3 h-[175px] lg:h-[236px] p-[20px] lg:p-[32px]">
                <div className="flex align-items-center">
                  <img src="/images/eco_freindly.svg" alt=""/>
                  <div className="ps-3 text-[18px] lg:text-[18px] text-[#1A614F] font-semibold">
                    Eco-Friendly Investment
                  </div>
                </div>
                <div className="mt-[18px] text-[14px] lg:text-[16px]">
                  Investing in farmland supports environmental conservation
                  while meeting the growing demand for sustainable living.
                </div>
              </div>
              <div className="bg-white mx-auto font-urbanist max-w-[340px] lg:w-[358px] rounded rounded-3 h-[175px] lg:h-[236px] p-[20px] lg:p-[40px]">
                <div className="flex align-items-center">
                  <img src="/images/dual_benefits.svg" alt=""/>
                  <div className="ps-3 text-[18px] lg:text-[20px] text-[#1A614F] font-semibold">
                    Tax Free Income
                  </div>
                </div>
                <div className="mt-[24px] text-[14px] lg:text-[16px]">
                  Enjoy tax savings and dual benefits with smart investments
                  that offer financial growth and long-term security.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
