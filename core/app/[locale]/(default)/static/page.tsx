import { locales } from '~/i18n/routing';

import HomePage from '../page';

export const runtime = 'edge';

export default HomePage;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
export const revalidate = 600;
