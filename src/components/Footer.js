import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const resources = [
    { label: "Home", to: "/" },
    { label: "Why Novara", to: "/whynovara" },
    { label: "Projects", to: "/projects" },
    { label: "Blogs", to: "/blogs" },
    { label: "Contact Us", to: "/contactus" },
    { label: "Privacy Policy", to: "/privacypolicy" },
    { label: "Terms & Conditions", to: "/termscondition" },
  ];

  const socialLinks = [
    { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61585877764871#", label: "Facebook" },
    { Icon: Instagram, href: "https://www.instagram.com/novaranatureestates/", label: "Instagram" },
    { Icon: Youtube, href: "https://www.youtube.com/@NovaraNatureEstates", label: "YouTube" },
    { Icon: Linkedin, href: "https://www.linkedin.com/company/novara-nature-estates/", label: "LinkedIn" },
  ];

  return (
    <footer className="w-full bg-[#52A09A] text-white font-urbanist">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-8">

        {/* ✅ Single responsive grid — no duplicate DOM, no SEO issues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-14">

          {/* Col 1 — Logo + About */}
          <div>
            <img
              src="/images/logo.svg"
              alt="Novara Nature Estates"
              className="w-[170px] h-auto mt-2"
            />
            <p className="mt-4 text-white/80 leading-relaxed max-w-sm">
              <b className="text-lg">Novara Nature Estates </b>focuses on thoughtfully
              planned farmland and land offerings designed for long-term value. With an
              emphasis on transparency, responsible planning, and natural surroundings,
              it delivers opportunities that support sustainable land ownership and
              future growth.
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="pt-0 sm:pt-[6px] lg:ms-20">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 list-none p-0 m-0">
              {resources.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.to}
                    className="text-[16px] sm:text-[18px] text-white/80 hover:text-white no-underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact Us */}
          <div className="pt-0 sm:pt-[6px]">
            <h3 className="text-2xl font-semibold">Contact Us</h3>
            <div className="mt-3 space-y-2 text-white/85">
              <div>
                <span>Location : </span>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://maps.app.goo.gl/cag4aTqXEW5BEZp87"
                  className="text-white no-underline"
                >
                  13th Cross Rd, F Block, Sahakar Nagar, Byatarayanapura,
                  Bengaluru, Karnataka 560092
                </a>
              </div>
              <div className="flex flex-wrap">
                Email :&nbsp;
                <a
                  href="mailto:info@novaranatureestates.com"
                  className="text-white/85 no-underline"
                >
                  info@novaranatureestates.com
                </a>
              </div>
              <div>
                Phone :{" "}
                <a href="tel:+918660200662" className="text-white/85 no-underline">
                  +91 8660200662
                </a>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-white hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/35" />
        <div className="mt-2 py-3 text-center text-[12px] sm:text-sm text-white/85">
          © 2025 All Rights Reserved. Designed by{" "}
          <a
            href="https://www.skyupdigitalsolutions.com/"
            target="_blank"
            rel="noreferrer"
            className="text-white no-underline"
          >
            SKYUP Digital Solutions
          </a>
        </div>

      </div>
    </footer>
  );
}