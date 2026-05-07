'use client';

import { useEffect } from 'react';

const SITE_NAME = "Mama K";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} | Mama K`;
  }, [title]);
}

