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
        width: 100%;
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
        display: grid;
        grid-template-columns: repeat(8, 208px);
        grid-template-rows: repeat(2, 208px);
        grid-gap: 36px;
        align-self: stretch;
        margin: 72px auto 36px;
    }

    .item {
        background: #262626;
        border-radius: 12px;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
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

    .class-title-wrapper {
        display: flex;
        align-items: center;
        max-width: 100%;
        padding: 0 48px;
    }

    .class-image {
        width: 96px;
        height: 96px;
        margin-right: 32px;
        flex: 0 0 96px;
    }

    .tags-wrapper {
        margin-top: 48px;
        display: flex;
        align-items: center;
    }

    .tag-image {
        height: 72px;
        width: auto;
    }

    .tag-image:not(:last-child) {
        margin-right: 18px;
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
        min-width: 0;
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .dofuslab-logo {
        margin-top: 48px;
        width: 480px;
    }`;
}

const ROOT = "https://d2iuiayak06k8j.cloudfront.net";

const ITEM_IMAGE_DIR = `${ROOT}/item/`;
const CLASS_IMAGE_DIR = `${ROOT}/class/face/`;
const TAG_IMAGE_DIR = `${ROOT}/icon/`;

const getItemImageUrl = (itemId: string) => {
  return `${ITEM_IMAGE_DIR}${itemId}.png`;
};

const getClassImageUrl = (dofusClass: string | null) => {
  return `${CLASS_IMAGE_DIR}${
    dofusClass ? `${dofusClass}_M.png` : "No_Class.svg"
  }`;
};

const getTagImageUrl = (tag: string | null) => {
  return `${TAG_IMAGE_DIR}${tag}.svg`;
};

export function getHtml(parsedReq: ParsedRequest) {
  const { text, items, dofusClass, tags } = parsedReq;
  return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss()}
    </style>
    <body>
        <div class="class-title-wrapper">
            <img class="class-image" src="${getClassImageUrl(dofusClass)}">
            <div class="title-wrapper">
                ${emojify(text)}
            </div>
        </div>
        ${
          tags.length
            ? `<div class="tags-wrapper">
                    ${tags
                      .map(
                        (tag) =>
                          `<img src=${getTagImageUrl(tag)} class="tag-image">`
                      )
                      .join("")}
                </div>`
            : ""
        }
        <div class="items-wrapper">
            ${items
              .map(
                (itemId) =>
                  `<div class="item">${getImage(
                    `${getItemImageUrl(itemId)}`
                  )}</div>`
              )
              .join("")}
            ${Array(16 - items.length)
              .fill(null)
              .map(() => '<div class="item"></div>')
              .join("")}
        </div>
        <img src="${ROOT}/logo/DL-Full_Dark.svg" class="dofuslab-logo">
    </body>
</html>`;
}

function getImage(src: string) {
  return `<img
        alt="Generated Image"
        src="${sanitizeHtml(src)}"
        width="170"
        height="170"
    />`;
}
