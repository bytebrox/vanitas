import { notFound } from 'next/navigation';

/** Catch unknown routes under a locale and render `[locale]/not-found`. */
export default function CatchAllPage() {
  notFound();
}
