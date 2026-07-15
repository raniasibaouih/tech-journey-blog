"use client";

import CheckersGame from '@/components/CheckersGame';

export default function HomeCheckersPreview() {
  return (
    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/90 p-4 shadow-md">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-emerald-900">Play checkers</h2>
        <p className="mt-2 text-lg leading-8 text-emerald-800">
          Jump into a simple AI match or invite a friend for a local two-player game.
        </p>
      </div>
      <CheckersGame />
    </div>
  );
}
