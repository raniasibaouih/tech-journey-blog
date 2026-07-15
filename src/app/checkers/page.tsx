import CheckersGame from '@/components/CheckersGame';

export default function CheckersPage() {
  return (
    <div className="w-full">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-4xl font-semibold">Checkers</h1>
        <p className="mt-2 text-lg opacity-80">
          This version gives you a simple one-player experience with an AI opponent and a two-player switch.
        </p>
      </div>

      <CheckersGame />
    </div>
  );
}
