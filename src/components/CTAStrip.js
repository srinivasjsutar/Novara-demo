export default function CTAStrip({
  title,
  description,
  ctaText,
  ctaLink = "/contactus",
  heightClass = "lg:h-[400px]",
  align = "center",
}) {
  return (
    <div
      className={`
        flex flex-col justify-center items-center
        text-${align}
        ${heightClass}
        px-4 py-[40px]
      `}
    >
      <h2 className="text-[24px] sm:text-[44px] lg:text-[60px] font-brushelva">
        {title}
      </h2>

      {description && (
        <p className="text-[14px] sm:text-[18px] lg:text-[20px] lg:mt-3 font-urbanist lg:w-[800px] text-center">
          {description}
        </p>
      )}

      <div className="mt-4 lg:mt-8 flex justify-center">
        <a
          href={ctaLink}
          className="
            font-urbanist
            bg-[#DCA000] text-white
            font-semibold text-sm sm:text-[18px] px-5 py-3
            lg:px-6 lg:py-3
            rounded-full
            shadow-[0_10px_24px_rgba(0,0,0,0.18)]
            hover:scale-[1.03] active:scale-[0.99]
            transition-transform
            inline-flex items-center justify-center
            no-underline
          "
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}