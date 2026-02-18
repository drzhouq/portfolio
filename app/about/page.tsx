import Image from "next/image";

export default function About() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <article>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Image
            src="/images/profile.png"
            alt="Aris Zhou"
            width={300}
            height={400}
            className="rounded-lg w-full max-w-[300px] h-auto mx-auto md:mx-0"
          />
          <div>
            <h3 className="text-2xl font-bold text-dark mb-4">About Me</h3>
            <p className="text-dark/80 mb-4 leading-relaxed">
              Hey! I&apos;m Aris, a Chinese-American artist from California.
              I&apos;m currently a junior studying Illustration at SVA in New
              York.
            </p>
            <p className="text-dark/80 mb-8 leading-relaxed">
              I&apos;m passionate about storytelling in art, and using my skills
              to share emotions, cultures, and create connection. I&apos;d love
              to be able to help you bring your creative vision to life, whether
              it&apos;s background design, merch design, editorial illustration,
              comics, or almost any other kind of art!
            </p>

            <h3 className="text-xl font-bold text-dark mb-4">
              Skills &amp; Expertise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Software Proficiency",
                  desc: "Adobe Creative Suite (Photoshop, Illustrator, InDesign), Procreate.",
                },
                {
                  title: "Design & Illustration",
                  desc: "Expertise in logo and branding, digital and print design, character and environmental art.",
                },
                {
                  title: "Digital Content",
                  desc: "Proficient in creating web graphics, banners, and social media content aligned with marketing strategies.",
                },
                {
                  title: "Collaboration & Feedback",
                  desc: "Effective at team collaboration and incorporating client feedback for design refinement.",
                },
                {
                  title: "Print & Layout",
                  desc: "Strong skills in brochure, poster, and flyer design.",
                },
                {
                  title: "UI Design Basics",
                  desc: "Familiarity with UI principles for creating user-friendly digital interfaces.",
                },
                {
                  title: "Languages",
                  desc: "Native English speaker, Understand and speak fluent Chinese.",
                },
              ].map((skill) => (
                <div
                  key={skill.title}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <p>
                    <strong className="text-dark">{skill.title}:</strong>{" "}
                    <span className="text-dark/70">{skill.desc}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
