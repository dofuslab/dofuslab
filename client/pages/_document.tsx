import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';

import { GA_TRACKING_ID } from '../gtag';

const metaDescription =
  'Experiment with your equipment at DofusLab, the open-source set builder for the MMORPG Dofus.';

export default class extends Document {
  render() {
    return (
      <html>
        <Head>
          <meta name="title" content="DofusLab" />
          <meta name="description" lang="en" content={metaDescription} />

          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://dofuslab.io/" />
          <meta property="og:title" content="DofusLab" />
          <meta property="og:description" content={metaDescription} />
          <meta
            property="og:image"
            content="https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Dark_Filled_BG_1200x628.png"
          />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://dofuslab.io/" />
          <meta property="twitter:title" content="DofusLab" />
          <meta property="twitter:description" content={metaDescription} />
          <meta
            property="twitter:image"
            content="https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Dark_Filled_BG_1200x628.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="../static/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="../static/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="../static/favicon-16x16.png"
          />
          <link rel="manifest" href="../static/site.webmanifest" />
          <link
            rel="mask-icon"
            href="../static/safari-pinned-tab.svg"
            color="#5bbad5"
          />
          <link rel="stylesheet" href="../twicon/twicon.css" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
                });
            `,
            }}
          />
          {/* Hotjar Tracking code for https://dofuslab.io */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:1775338,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
