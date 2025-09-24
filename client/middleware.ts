import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// eslint-disable-next-line import/prefer-default-export
export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return undefined;
  }

  if (req.nextUrl.locale === 'default') {
    const locale = req.cookies.get('NEXT_LOCALE')?.value || 'en';

    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${req.nextUrl.pathname}`;

    return NextResponse.redirect(new URL(url, req.url));
  }

  return undefined;
}
