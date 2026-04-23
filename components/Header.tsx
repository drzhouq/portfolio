"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SiteSettings } from "@/lib/types";

const navLinks = [
  { title: "Illustrations", url: "/" },
  { title: "Sketchbook", url: "/sketchbook" },
  { title: "Comics", url: "/comics" },
  { title: "About Me", url: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "k" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        router.push("/kiosk");
      }
    };
    document.addEventListener("keyup", handleKeyUp);
    return () => document.removeEventListener("keyup", handleKeyUp);
  }, [router]);

  const logoIcon = settings?.logoIconUrl || "/images/logos/arislogodark.svg";
  const logoName = settings?.logoNameUrl || "/images/logos/arisnamedark.svg";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-beige">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <img
              src={logoIcon}
              alt="Aris Zhou Logo"
              className="w-[50px] h-[50px] object-contain"
            />
          </Link>
          <img
            src={logoName}
            alt="Aris Zhou"
            className="hidden sm:block h-[50px] w-auto object-contain"
          />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-dark transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-dark transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-dark transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              className={`text-lg hover:text-base-light transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-base-light after:transition-all ${
                pathname === link.url
                  ? "text-base after:w-full"
                  : "text-dark after:w-0 hover:after:w-full"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Social links */}
        <div className="hidden md:flex items-center gap-3 text-dark">
          <a
            href="mailto:aris.c.zhou@gmail.com"
            className="text-sm hover:text-base-light transition-colors"
          >
            aris.c.zhou@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/aris-zhou-128bb524a/"
            aria-label="LinkedIn"
            className="hover:text-base-light transition-colors"
          >
            <i className="fab fa-linkedin text-xl" />
          </a>
          <a
            href="https://www.instagram.com/kaseikiwi/"
            aria-label="Instagram"
            className="hover:text-base-light transition-colors"
          >
            <i className="fab fa-instagram text-xl" />
          </a>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute right-0 top-0 bottom-0 w-[70%] bg-[#1a1a1a] p-8 pt-20 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                onClick={() => setMenuOpen(false)}
                className={`text-xl ${
                  pathname === link.url ? "text-base-light" : "text-white"
                } hover:text-base-light transition-colors`}
              >
                {link.title}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3 text-white">
              <a
                href="mailto:aris.c.zhou@gmail.com"
                className="text-sm hover:text-base-light"
              >
                aris.c.zhou@gmail.com
              </a>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/aris-zhou-128bb524a/"
                  className="hover:text-base-light"
                >
                  <i className="fab fa-linkedin text-xl" />
                </a>
                <a
                  href="https://www.instagram.com/kaseikiwi/"
                  className="hover:text-base-light"
                >
                  <i className="fab fa-instagram text-xl" />
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
