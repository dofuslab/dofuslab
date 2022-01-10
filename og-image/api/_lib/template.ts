import { sanitizeHtml } from './sanitizer';
import { ImageType, ParsedRequest } from './types';
import { getTagImageUrl, getClassImageUrl, ROOT } from './utils';
const twemoji = require('twemoji');
const twOptions = { folder: 'svg', ext: '.svg' };
const emojify = (text: string) => twemoji.parse(text, twOptions);

function getCss() {
  return `
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap");

body {
  background: #1f1f1f;
  background-size: 100px 100px;
  height: 100vh;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  margin-left: -8px;
}

.items-wrapper {
  display: grid;
  grid-template-columns: repeat(8, 208px);
  grid-template-rows: repeat(2, 208px);
  grid-gap: 36px;
  align-self: stretch;
  margin: 48px 66px 36px 66px;
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

.item-slot img {
  opacity: 0.4;
}

.spacer {
  margin: 150px;
}

.emoji {
  height: 1em;
  width: 1em;
  margin: 0 0.05em 0 0.1em;
  vertical-align: -0.1em;
}

.class-title-wrapper {
  display: flex;
  align-items: center;
  max-width: 100%;
  padding: 0 48px;
  box-sizing: border-box;
}

.class-image {
  width: 96px;
  height: 96px;
  margin-right: 32px;
  flex: 0 0 96px;
}

.tags-wrapper {
  margin-top: 36px;
  display: flex;
  align-items: center;
}

.level {
  background: #f0f0f0;
  color: #262626;
  padding: 16px;
  border-radius: 8px;
  font-size: 48px;
  font-family: "Poppins", sans-serif;
  margin-right: 32px;
}

.tag-image {
  height: 72px;
  width: auto;
}

.tag-image:not(:last-child) {
  margin-right: 18px;
}

.title-wrapper {
  font-family: "Poppins", sans-serif;
  font-size: 96px;
  font-style: normal;
  line-height: 1;
  color: white;
  font-weight: 700;
  align-items: center;
  min-width: 0;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.title-wrapper .emoji {
  margin-top: 16px;
}

.dofuslab-logo {
  margin-top: 48px;
  width: 480px;
}
    `;
}

export function getHtml(parsedReq: ParsedRequest) {
  const { text, images, dofusClass, tags, gender, level } = parsedReq;
  const result = `
<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss()}
    </style>
    <body>
        <div class="class-title-wrapper">
            <img class="class-image" src="${getClassImageUrl(
              dofusClass,
              gender,
            )}">
            <div class="title-wrapper">
                ${emojify(text)}
            </div>
        </div>
        ${
          tags.length
            ? `<div class="tags-wrapper">
                  ${level ? `<span class="level">Level ${level}</span>` : ''}
                    ${tags
                      .map(
                        (tag) =>
                          `<img src=${getTagImageUrl(tag)} class="tag-image">`,
                      )
                      .join('')}
                </div>`
            : ''
        }
        <div class="items-wrapper">
            ${images
              .map(
                ({ url, type }) =>
                  `<div class="item${
                    type === ImageType.SLOT ? ' item-slot' : ''
                  }">${getImage(url)}</div>`,
              )
              .join('')}
            ${Array(16 - images.length)
              .fill(null)
              .map(() => '<div class="item"></div>')
              .join('')}
        </div>
        <img src="${ROOT}/logo/DL-Full_Dark.svg" class="dofuslab-logo">
    </body>
</html>
  `;

  return result;
}

function getImage(src: string) {
  return `<img
        alt="Generated Image"
        src="${sanitizeHtml(src)}"
        width="170"
        height="170"
    />`;
}
