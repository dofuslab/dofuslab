export interface ParsedRequest {
  text: string;
  images: Array<string>;
  dofusClass: string | null;
  tags: Array<string>;
  gender: 'M' | 'F';
}
