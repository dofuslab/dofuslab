import { APIGatewayEvent } from 'aws-lambda';
import { Image, ImageType, ParsedRequest } from './types';
import { getItemImageUrl, getSlotImageUrl } from './utils';

const SLOTS = [
  'hat',
  'cloak',
  'amulet',
  'ring',
  'belt',
  'boots',
  'weapon',
  'shield',
  'dofus',
  'pet',
] as const;

const NUM_ITEMS = { ring: 2, dofus: 6 };

function parseMultiParams(
  key: 'items' | 'ring' | 'dofus' | 'tags',
  req: APIGatewayEvent,
) {
  let result: Array<string> = [];
  const paramsString = req.queryStringParameters?.[key];
  if (paramsString) {
    result = paramsString.split(',');
  }
  if (key in NUM_ITEMS && NUM_ITEMS[key as 'ring' | 'dofus'] > result.length) {
    for (let i = result.length; i < NUM_ITEMS[key as 'ring' | 'dofus']; i++) {
      result.push('');
    }
  }
  return result;
}

function stringToNumber(str: string) {
  if (Number.isInteger(Number(str))) return Number(str);
  return str.split('').reduce((acc, curr) => {
    return acc + curr.charCodeAt(0);
  }, 0);
}

function getLogoUrlFromHash(hash: number) {
  return hash % 100 > 99 ? 'DL-Full_Dark_Crimson.svg' : 'DL-Full_Dark.svg';
}

export function parseRequest(
  // type seems to be incorrect, rawPath provided instead of path
  req: APIGatewayEvent & { rawPath?: string },
): ParsedRequest {
  const { rawPath } = req;
  let items: string[] = [];
  let dofusClass = null;
  let tags: string[] = [];

  items = parseMultiParams('items', req);

  tags = parseMultiParams('tags', req) || [];

  dofusClass = req.queryStringParameters?.class || null;

  let hash = 0;

  const arr = (rawPath || '/').slice(1).split('.');
  let text = '';
  if (arr.length === 0) {
    text = '';
  } else if (arr.length === 1) {
    text = arr[0];
  } else {
    text = arr.join('.');
  }

  const parsedGender =
    req.queryStringParameters?.gender === 'F' ? ('F' as const) : ('M' as const);

  const levelParam = Number(req.queryStringParameters?.level);

  const parsedLevel = Number.isInteger(levelParam) ? levelParam : undefined;

  hash = [text, ...tags].reduce(
    (acc, curr) => acc + stringToNumber(curr),
    parsedLevel || 0,
  );

  if (parsedGender === 'M') {
    hash += 1;
  } else if (parsedGender === 'F') {
    hash += 2;
  }

  const parsedRequestBase = {
    text: decodeURIComponent(text),
    dofusClass,
    tags,
    gender: parsedGender,
    level: parsedLevel,
  };

  if (items.length === 0) {
    const images: Array<Image> = [];
    SLOTS.forEach((slot) => {
      if (slot === 'ring' || slot === 'dofus') {
        parseMultiParams(slot, req).forEach((itemId) => {
          if (itemId) {
            hash += stringToNumber(itemId);
          }
          images.push(
            itemId
              ? { url: getItemImageUrl(itemId), type: ImageType.ITEM }
              : { url: getSlotImageUrl(slot), type: ImageType.SLOT },
          );
        });
      } else {
        const itemId = req.queryStringParameters?.[slot];
        if (itemId) {
          hash += stringToNumber(itemId);
        }
        images.push(
          itemId
            ? { url: getItemImageUrl(itemId), type: ImageType.ITEM }
            : { url: getSlotImageUrl(slot), type: ImageType.SLOT },
        );
      }
    });

    return {
      ...parsedRequestBase,
      images,
      logoImage: getLogoUrlFromHash(hash),
    };
  }

  const parsedRequest = {
    ...parsedRequestBase,
    images: items.map((itemId) => ({
      url: getItemImageUrl(itemId),
      type: ImageType.ITEM,
    })),
    logoImage: getLogoUrlFromHash(hash),
  };

  return parsedRequest;
}
