import { sanitizeHtml } from "./sanitizer";
import { ParsedRequest } from "./types";
const twemoji = require("twemoji");
const twOptions = { folder: "svg", ext: ".svg" };
const emojify = (text: string) => twemoji.parse(text, twOptions);

function getCss() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');

    body {
        background: #1f1f1f;
        background-size: 100px 100px;
        height: 100vh;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    code {
        color: #D400FF;
        font-family: 'Vera';
        white-space: pre-wrap;
        letter-spacing: -5px;
    }

    code:before,
    code:after {
        content: '\`';
    }

    .items-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-self: stretch;
        margin-top: 72px;
        margin-left: 24px;
    }

    .item {
        background: #262626;
        border-radius: 12px;
        padding: 12px;
        flex: 0 0 180px;
        margin-left: 36px;
        height: 180px;
        margin-bottom: 36px;
    }

    .spacer {
        margin: 150px;
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }

    .title-wrapper {
        font-family: 'Poppins', sans-serif;
        font-size: 96px;
        font-style: normal;
        line-height: 1;
        color: white;
        font-weight: 700;
        display: flex;
        align-items: center;
    }

    .dofuslab-logo {
        margin-top: 48px;
        width: 480px;
    }`;
}

const IMAGE_DIR = "https://dofus-lab.s3.us-east-2.amazonaws.com/item/";

const getImageUrl = (itemId: string) => {
  return `${IMAGE_DIR}${itemId}.png`;
};

export function getHtml(parsedReq: ParsedRequest) {
  const { text, items } = parsedReq;
  return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>G-wrapperenerated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss()}
    </style>
    <body>
        <div class="title-wrapper">
          ${emojify(text)}
        </div>
        <div class="items-wrapper">
            ${items.map(
              (itemId) =>
                `<div class="item">${getImage(`${getImageUrl(itemId)}`)}</div>`
            )}
            ${Array(16 - items.length)
              .fill(null)
              .map(() => '<div class="item"></div>')}
        </div>
        <img src="https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Dark.svg" class="dofuslab-logo">
    </body>
</html>`;
}

function getImage(src: string) {
  return `<img
        class="logo"
        alt="Generated Image"
        src="${sanitizeHtml(src)}"
        width="170"
        height="170"
    />`;
}
