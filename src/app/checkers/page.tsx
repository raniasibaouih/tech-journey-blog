import CheckersGame from '@/components/CheckersGame';

export default function CheckersPage() {
  return (
    <div className="w-full">
      <div className="mb-8 max-w-3xl rounded-2xl border border-base-300 bg-base-200/70 p-6 shadow-sm">
        <h1 className="text-4xl font-semibold">Welcome to the checkers lounge</h1>
        <p className="mt-3 text-lg leading-8 opacity-80">
          Choose a relaxing match against a simple AI or invite a friend for a local two-player game.
        </p>
      </div>

      <CheckersGame />
    </div>
  );
}
