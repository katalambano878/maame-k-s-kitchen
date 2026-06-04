'use client';

import { Suspense } from 'react';
import MealPrepPage from './MealPrepPage';

function MealPrepFallback() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<MealPrepFallback />}>
      <MealPrepPage />
    </Suspense>
  );
}
