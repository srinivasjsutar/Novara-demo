import { motion } from "framer-motion";

export default function EcovaraHeroBlock({
  bgSrc = "/images/Ecovara _11zon.webp",
}) {
  return (
    <section className="relative w-full">
      {/* Background image */}
      <div className="relative h-[240px] w-full overflow-visible sm:h-[360px] lg:h-[600px]">
        <img
          src={bgSrc}
          alt="Ecovara Entrance"
          className="h-full w-full object-cover"
          draggable="false"
        />

        {/* Overlay Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            absolute inset-x-0 top-44 z-10
            flex justify-center
            sm:bottom-6
            lg:inset-auto lg:left-10 lg:bottom-1 lg:block
          "
        >
          <div className="w-[340px] h-[113px] rounded-[22px] px-2 py-3 bg-[#083b33] lg:bg-[#083b33]/80 ring-1 ring-white/15 overflow-hidden sm:w-[520px] sm:h-auto sm:px-5 sm:py-4 lg:w-[800px] lg:h-[160px] lg:rounded-[26px] lg:px-3 lg:py-2 flex flex-col lg:flex-row lg:items-center">
            {/* Left: headline */}
            <div className="lg:flex-1">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-brushelva ms-3 lg:ms-2 text-[22px] leading-tight text-white sm:text-[30px] lg:text-[44px]"
              >
                Estate-Style&nbsp;
                <span className="text-[#DCA000] font-brushelva">living</span>
              </motion.h3>
            </div>

            {/* Divider (desktop only) */}
            <div className="hidden lg:block me-8 h-[120px] w-px bg-[#FFD698]" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center lg:mt-5 lg:flex lg:flex-1 lg:justify-between">
              <Stat k="800+" label="Existing Trees" delay={0.05} />
              <Stat k="80%" label="Open Space" delay={0.12} />
              <Stat k="15" label="Acres Project" delay={0.18} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ k, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className="min-w-0 lg:mb-10"
    >
      <div className="text-[#DCA000] font-semibold font-urbanist text-[22px] sm:text-[26px] lg:text-[44px]">
        {k}
      </div>
      <div className="text-white/70 text-[12px] font-urbanist sm:text-[13px] lg:text-[20px]">
        {label}
      </div>
    </motion.div>
  );
}