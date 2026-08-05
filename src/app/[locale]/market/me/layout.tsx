import { buildPageMetadata } from '@/lib/metadata';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    route: 'marketAccount',
    path: '/market/me',
    image: '/og.jpg',
    noindex: true,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
