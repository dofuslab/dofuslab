export const ROOT = 'https://d2iuiayak06k8j.cloudfront.net';

const ITEM_IMAGE_DIR = `${ROOT}/item/`;
const CLASS_IMAGE_DIR = `${ROOT}/class/face/`;
const TAG_IMAGE_DIR = `${ROOT}/icon/`;
const SLOT_IMAGE_DIR = `${ROOT}/icon/`;

export const getItemImageUrl = (itemId: string) => {
  return `${ITEM_IMAGE_DIR}${itemId}.png`;
};

export const getClassImageUrl = (
  dofusClass: string | null,
  gender?: 'M' | 'F' | null,
) => {
  return `${CLASS_IMAGE_DIR}${
    dofusClass ? `${dofusClass}_${gender || 'M'}.png` : 'No_Class.svg'
  }`;
};

export const getTagImageUrl = (tag: string | null) => {
  return `${TAG_IMAGE_DIR}${tag}.svg`;
};

const capitalizeFirst = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export const getSlotImageUrl = (slot: string) => {
  return `${SLOT_IMAGE_DIR}${capitalizeFirst(slot)}.svg`;
};
