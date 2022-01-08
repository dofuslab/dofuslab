import { APIGatewayProxyHandler } from "aws-lambda";
import { parseRequest } from "./_lib/parser";
import { getScreenshot } from "./_lib/chromium";
import { getHtml } from "./_lib/template";

const isDev = process.env.NOW_REGION === "dev1";
const isHtmlDebug = process.env.OG_HTML_DEBUG === "1";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const parsedReq = parseRequest(event);
    const html = getHtml(parsedReq);
    if (isHtmlDebug) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify(html),
      };
    }

    const file = await getScreenshot(html, isDev);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
      },
      multiValueHeaders: {
        "Cache-Control": [
          "public",
          "immutable",
          "no-transform",
          "s-maxage=31536000",
          "max-age=31536000",
        ],
      },
      body: file.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/html",
      },
      body: JSON.stringify(
        "<h1>Internal Error</h1><p>Sorry, there was a problem</p>"
      ),
    };
  }
};

export default handler;
