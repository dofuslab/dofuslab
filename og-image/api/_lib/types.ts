export enum ImageType {
  SLOT,
  ITEM,
}

export type Image = { url: string; type: ImageType };

export interface ParsedRequest {
  text: string;
  images: Array<Image>;
  dofusClass: string | null;
  tags: Array<string>;
  gender: 'M' | 'F';
  level?: number;
  logoImage: string;
}
