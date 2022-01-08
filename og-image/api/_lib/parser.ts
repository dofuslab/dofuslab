import { IncomingMessage } from "http";
import { parse } from "url";
import { ParsedRequest } from "./types";

export function parseRequest(req: IncomingMessage) {
  console.log("HTTP " + req.url);
  const { pathname, query } = parse(req.url || "/", true);
  const { items } = query || {};

  const arr = (pathname || "/").slice(1).split(".");
  let text = "";
  if (arr.length === 0) {
    text = "";
  } else if (arr.length === 1) {
    text = arr[0];
  } else {
    text = arr.join(".");
  }

  const parsedRequest: ParsedRequest = {
    text: decodeURIComponent(text),
    items: getArray(items),
  };
  parsedRequest.items = getDefaultImages(parsedRequest.items);
  return parsedRequest;
}

function getArray(stringOrArray: string[] | string | undefined): string[] {
  if (typeof stringOrArray === "undefined") {
    return [];
  } else if (Array.isArray(stringOrArray)) {
    return stringOrArray;
  } else {
    return [stringOrArray];
  }
}

function getDefaultImages(items: string[]): string[] {
  return items;
}
