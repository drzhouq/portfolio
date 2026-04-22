export interface Artwork {
  id: string;
  title: string;
  category: 'illustrations' | 'comics' | 'graphic_design' | 'sketchbook' | 'visdev';
  tags: string[];
  imageUrl: string;
  thumbnailUrl?: string;
  annotation: string;
  medium: string;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  views: number;
  totalViewTimeMs: number;
  hearts: number;
  lastViewedAt: string | null;
}

export interface AboutSkill {
  title: string;
  desc: string;
}

export interface SiteSettings {
  showAnnotations: boolean;
  logoIconUrl?: string | null;
  logoNameUrl?: string | null;
  profilePhotoUrl?: string | null;
  aboutBio?: string[];
  aboutSkills?: AboutSkill[];
}
