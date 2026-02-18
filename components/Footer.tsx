import Link from "next/link";

const navLinks = [
  { title: "Illustrations", url: "/" },
  { title: "Sketchbook", url: "/sketchbook" },
  { title: "Comics", url: "/comics" },
  { title: "About Me", url: "/about" },
];

export default function Footer() {
  return (
    <footer className="bg-beige border-t border-dark/10 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-6 mb-4">
          {navLinks.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              className="text-dark hover:text-base-light transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </nav>
        <div className="text-center text-dark/70 text-sm">
          <a
            href="mailto:aris.c.zhou@gmail.com"
            className="hover:text-base-light transition-colors"
          >
            aris.c.zhou@gmail.com
          </a>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Aris Zhou
          </p>
        </div>
      </div>
    </footer>
  );
}
