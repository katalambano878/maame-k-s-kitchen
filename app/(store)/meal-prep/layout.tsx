import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekly Meal Prep Subscription',
  description:
    "Subscribe to Maame K's Kitchen weekly meal prep in Cornerstone, Calgary. Choose your meals each week — cancel anytime with 3 days notice before delivery.",
  openGraph: {
    title: 'Weekly Meal Prep | Maame K\u2019s Kitchen',
    description: 'Ghanaian meal prep delivered weekly. Pick your dishes, pay automatically, cancel with notice.',
  },
};

export default function MealPrepLayout({ children }: { children: React.ReactNode }) {
  return children;
}
