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
  if (req.multiValueQueryStringParameters?.[key]) {
    result = req.multiValueQueryStringParameters.items;
  } else if (req.queryStringParameters?.[key]) {
    result = req.queryStringParameters?.[key].split(',');
  }
  if (key in NUM_ITEMS && NUM_ITEMS[key as 'ring' | 'dofus'] > result.length) {
    for (let i = result.length; i < NUM_ITEMS[key as 'ring' | 'dofus']; i++) {
      result.push('');
    }
  }
  return result;
}

export function parseRequest(req: APIGatewayEvent): ParsedRequest {
  const { path } = req;
  let items: string[] = [];
  let dofusClass = null;
  let tags: string[] = [];

  items = parseMultiParams('items', req);

  tags = parseMultiParams('tags', req) || [];

  dofusClass = req.queryStringParameters?.class || null;

  const arr = (path || '/').slice(1).split('.');
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

  const parsedRequestBase = {
    text: decodeURIComponent(text),
    dofusClass,
    tags,
    gender: parsedGender,
  };

  if (items.length === 0) {
    const images: Array<Image> = [];
    SLOTS.forEach((slot) => {
      if (slot === 'ring' || slot === 'dofus') {
        parseMultiParams(slot, req).forEach((itemId) => {
          images.push(
            itemId
              ? { url: getItemImageUrl(itemId), type: ImageType.ITEM }
              : { url: getSlotImageUrl(slot), type: ImageType.SLOT },
          );
        });
      } else {
        const itemId = req.queryStringParameters?.[slot];
        images.push(
          itemId
            ? { url: getItemImageUrl(itemId), type: ImageType.ITEM }
            : { url: getSlotImageUrl(slot), type: ImageType.SLOT },
        );
      }
    });

    return { ...parsedRequestBase, images };
  }

  const parsedRequest = {
    ...parsedRequestBase,
    images: items.map((itemId) => ({
      url: getItemImageUrl(itemId),
      type: ImageType.ITEM,
    })),
  };
  return parsedRequest;
}
