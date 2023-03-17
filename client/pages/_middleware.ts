import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

/**
 * This middleware intercepts a request and redirects the user to
 * their preferred language.
 *
 * @param request
 * @returns redirected url pathname with correct locale appended
 */

// eslint-disable-next-line import/prefer-default-export
export function middleware(request: NextRequest) {
  if (
    PUBLIC_FILE.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname.includes('/api/')
  ) {
    return undefined;
  }

  const suggestedLocale = request.cookies.NEXT_LOCALE;

  if (!suggestedLocale || request.nextUrl.locale === suggestedLocale) {
    return undefined;
  }

  return NextResponse.redirect(
    suggestedLocale === request.nextUrl.defaultLocale
      ? request.nextUrl.pathname
      : `/${suggestedLocale}${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
}
