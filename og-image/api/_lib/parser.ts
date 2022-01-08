import { ParsedRequest } from "./types";
import { APIGatewayEvent } from "aws-lambda";

export function parseRequest(req: APIGatewayEvent) {
  const { path } = req;
  let items: string[] = [];
  let dofusClass = null;
  let tags: string[] = [];

  if (req.multiValueQueryStringParameters?.items) {
    items = req.multiValueQueryStringParameters.items;
  } else if (req.queryStringParameters?.items) {
    items = req.queryStringParameters.items.split(",");
  }

  if (req.multiValueQueryStringParameters?.tags) {
    tags = req.multiValueQueryStringParameters.tags;
  } else if (req.queryStringParameters?.tags) {
    tags = req.queryStringParameters.tags.split(",");
  }

  dofusClass = req.queryStringParameters?.class || null;

  const arr = (path || "/").slice(1).split(".");
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
    items: items,
    dofusClass,
    tags,
  };
  return parsedRequest;
}
