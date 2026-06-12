import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, Mail } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { urlPathname } = usePageContext();

  const links = [
    { to: "/", label: "Home" },
    { to: "/whynovara", label: "Why Novara" },
    { to: "/projects", label: "Projects" },
    { to: "/blogs", label: "Blogs" },
    { to: "/contactus", label: "Contact Us" },
  ];

  const social = [
    {
      iconSrc: "/images/fb.svg",
      href: "https://www.facebook.com/profile.php?id=61585877764871#",
      label: "Facebook",
    },
    {
      iconSrc: "/images/insta.svg",
      href: "https://www.instagram.com/novaranatureestates/",
      label: "Instagram",
    },
    {
      iconSrc: "/images/yt.svg",
      href: "https://www.youtube.com/@NovaraNatureEstates",
      label: "YouTube",
    },
    {
      iconSrc: "/images/linkedin1.svg",
      href: "https://www.linkedin.com/company/novara-nature-estates/",
      label: "LinkedIn",
    },
  ];

  const isActive = (to) => {
    if (to === "/") return urlPathname === "/";
    return urlPathname.startsWith(to);
  };

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [urlPathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.6 }}
        className="sticky font-urbanist top-0 z-50 w-full bg-[#52A09A]"
      >
        <div className="mx-auto flex h-[90px] lg:max-w-[1420px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 !no-underline">
            <img
              src="/images/logo.svg"
              alt="Novara Nature Estates"
              className="w-[156px] h-[48px] lg:w-[208px] lg:h-[64px] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden flex-1 justify-center lg:flex">
            <div className="relative inline-flex items-center gap-2 lg:ms-4 2xl:ms-0 rounded-full bg-white/95 p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              {links.map((l) => {
                const active = isActive(l.to);
                return (
                  <a
                    key={l.label}
                    href={l.to}
                    className={[
                      "relative z-10 rounded-full px-7 py-2 text-[15px] font-semibold",
                      "transition-colors duration-200 !no-underline",
                      active
                        ? "text-[#0C4A43]"
                        : "text-[#1B2B2A] hover:text-[#0C4A43]",
                    ].join(" ")}
                  >
                    {active && (
                      <motion.span
                        layoutId="navActivePill"
                        className="absolute inset-0 -z-10 rounded-full bg-white border border-[#148240]"
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 40,
                          mass: 0.7,
                        }}
                      />
                    )}
                    <motion.span
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.12 }}
                    >
                      {l.label}
                    </motion.span>
                  </a>
                );
              })}
            </div>
          </nav>

          {/* Desktop: Social + Phone */}
          <div className="hidden items-center gap-4 lg:flex lg:ml-0 2xl:-ml-8">
            <div className="flex items-center gap-3">
              {social.map(({ iconSrc, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center h-[36px] w-[36px] rounded-full overflow-hidden bg-white shadow-[0_6px_14px_rgba(0,0,0,0.14)]"
                >
                  <img
                    src={iconSrc}
                    alt={label}
                    className="h-full w-full object-contain p-2"
                  />
                </motion.a>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-white">
              <a
                href="tel:+918660200662"
                className="flex items-center gap-2 text-[15px] text-white font-semibold !no-underline hover:opacity-90"
              >
                <span className="grid place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <img
                    src="/images/call_icon.svg"
                    alt="Phone"
                    className="h-8 w-8"
                  />
                </span>
                <span>+91-8660200662</span>
              </a>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <motion.button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            whileTap={{ scale: 0.96 }}
            className="inline-flex lg:hidden h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25"
            aria-label="Open menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-0 right-0 top-[104px] z-50 bg-[#52A09A] lg:hidden"
          >
            <div className="mx-auto max-w-[1400px] px-4 pb-5 pt-4 sm:px-6">
              <div className="rounded-2xl bg-white/95 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                <nav className="flex flex-col gap-1">
                  {links.map((l) => {
                    const active = isActive(l.to);
                    return (
                      <a
                        key={l.label}
                        href={l.to}
                        className={[
                          "rounded-xl px-4 py-3 text-[15px] font-semibold !no-underline",
                          active
                            ? "bg-[#EAF7F6] text-[#0C4A43]"
                            : "text-[#1B2B2A]",
                        ].join(" ")}
                      >
                        {l.label}
                      </a>
                    );
                  })}
                </nav>

                <div className="mt-4 flex items-center gap-2">
                  {social.map(({ iconSrc, href, label }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center h-[36px] w-[36px] rounded-full overflow-hidden bg-white shadow-[0_6px_14px_rgba(0,0,0,0.14)]"
                    >
                      <img
                        src={iconSrc}
                        alt={label}
                        className="h-full w-full object-contain p-2"
                      />
                    </motion.a>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-[14px] font-semibold text-[#174E49]">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+91-8660200662</span>
                  </div>
                  <div className="flex items-center gap-2 break-all">
                    <Mail className="h-4 w-4" />
                    <span>info@novaranatureestates.com</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
