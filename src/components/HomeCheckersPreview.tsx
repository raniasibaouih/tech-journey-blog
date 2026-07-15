"use client";

import CheckersGame from '@/components/CheckersGame';

export default function HomeCheckersPreview() {
  return (
    <div className="rounded-[1.5rem] border border-stone-300 bg-white p-4 shadow-md">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-stone-900">Play now</h2>
      </div>
      <CheckersGame />
    </div>
  );
}
