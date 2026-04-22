"use client";

import { useState } from "react";
import { SiteSettings, AboutSkill } from "@/lib/types";

const DEFAULT_BIO = [
  "Hey! I'm Aris, a Chinese-American artist from California. I'm currently a junior studying Illustration at SVA in New York.",
  "I'm passionate about storytelling in art, and using my skills to share emotions, cultures, and create connection. I'd love to be able to help you bring your creative vision to life, whether it's background design, merch design, editorial illustration, comics, or almost any other kind of art!",
];

const DEFAULT_SKILLS: AboutSkill[] = [
  { title: "Software Proficiency", desc: "Adobe Creative Suite (Photoshop, Illustrator, InDesign), Procreate." },
  { title: "Design & Illustration", desc: "Expertise in logo and branding, digital and print design, character and environmental art." },
  { title: "Digital Content", desc: "Proficient in creating web graphics, banners, and social media content aligned with marketing strategies." },
  { title: "Collaboration & Feedback", desc: "Effective at team collaboration and incorporating client feedback for design refinement." },
  { title: "Print & Layout", desc: "Strong skills in brochure, poster, and flyer design." },
  { title: "UI Design Basics", desc: "Familiarity with UI principles for creating user-friendly digital interfaces." },
  { title: "Languages", desc: "Native English speaker, Understand and speak fluent Chinese." },
];

interface AboutEditorProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
}

export default function AboutEditor({ settings, onUpdate }: AboutEditorProps) {
  const [bio, setBio] = useState<string[]>(settings.aboutBio ?? DEFAULT_BIO);
  const [skills, setSkills] = useState<AboutSkill[]>(settings.aboutSkills ?? DEFAULT_SKILLS);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const updateBio = (index: number, value: string) => {
    const next = [...bio];
    next[index] = value;
    setBio(next);
    setDirty(true);
  };

  const addBio = () => {
    setBio([...bio, ""]);
    setDirty(true);
  };

  const removeBio = (index: number) => {
    setBio(bio.filter((_, i) => i !== index));
    setDirty(true);
  };

  const updateSkill = (index: number, field: keyof AboutSkill, value: string) => {
    const next = [...skills];
    next[index] = { ...next[index], [field]: value };
    setSkills(next);
    setDirty(true);
  };

  const addSkill = () => {
    setSkills([...skills, { title: "", desc: "" }]);
    setDirty(true);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({ aboutBio: bio, aboutSkills: skills });
    setSaving(false);
    setDirty(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-dark/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-dark">About Me Content</h3>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-1.5 bg-base text-white rounded hover:bg-base-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* Bio paragraphs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-dark/70">Bio Paragraphs</label>
          <button onClick={addBio} className="text-xs text-base hover:text-base-light">
            + Add paragraph
          </button>
        </div>
        <div className="space-y-2">
          {bio.map((paragraph, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                value={paragraph}
                onChange={(e) => updateBio(i, e.target.value)}
                rows={3}
                className="flex-1 border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
              />
              {bio.length > 1 && (
                <button
                  onClick={() => removeBio(i)}
                  className="text-red-400 hover:text-red-600 text-sm px-1"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-dark/70">Skills</label>
          <button onClick={addSkill} className="text-xs text-base hover:text-base-light">
            + Add skill
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((skill, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                value={skill.title}
                onChange={(e) => updateSkill(i, "title", e.target.value)}
                placeholder="Title"
                className="w-40 border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
              />
              <input
                value={skill.desc}
                onChange={(e) => updateSkill(i, "desc", e.target.value)}
                placeholder="Description"
                className="flex-1 border border-dark/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-base"
              />
              <button
                onClick={() => removeSkill(i)}
                className="text-red-400 hover:text-red-600 text-sm px-1 mt-2"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
