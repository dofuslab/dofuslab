import Document, {
  Head,
  Main,
  NextScript,
  Html,
  DocumentProps,
  DocumentContext,
} from 'next/document';
import { extractStyle, createCache, StyleProvider } from '@ant-design/cssinjs';

import { GA_TRACKING_ID } from '../gtag';

const DofusLabDocument = ({ __NEXT_DATA__ }: DocumentProps) => {
  return (
    // eslint-disable-next-line no-underscore-dangle
    <Html lang={__NEXT_DATA__.props.initialLanguage}>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/static/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/favicon-16x16.png"
        />
        <link rel="manifest" href="/static/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/static/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="stylesheet" href="/twicon/twicon.css" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <script
          // eslint-disable-next-line react/no-danger
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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

DofusLabDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => (
        <StyleProvider cache={cache}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <App {...props} />
        </StyleProvider>
      ),
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};

export default DofusLabDocument;
