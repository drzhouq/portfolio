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
}
