"use client";

import { useMemo, useState } from 'react';
import {
  createInitialBoard,
  getAllLegalMoves,
  getMovesForPiece,
  makeMove,
  type Board,
  type Move,
  type Player,
} from '@/lib/checkers/game';

const BOARD_SIZE = 8;
const COLORS = {
  red: 'bg-red-600',
  black: 'bg-neutral-800',
};

function isDarkSquare(row: number, col: number) {
  return (row + col) % 2 === 1;
}

function getPieceLabel(piece: { color: Player; king: boolean } | null) {
  if (!piece) return '';
  return piece.king ? 'K' : '●';
}

function getRandomMove(moves: Move[]) {
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function CheckersGame() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'pvp' | 'ai'>('ai');
  const [message, setMessage] = useState('Red starts. Choose a piece to move.');

  const legalMoves = useMemo(() => getAllLegalMoves(board, currentPlayer), [board, currentPlayer]);

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (!piece) {
      if (selected) {
        const availableMoves = getMovesForPiece(board, selected[0], selected[1]);
        const move = availableMoves.find(
          (candidate) => candidate.to.row === row && candidate.to.col === col,
        );

        if (move) {
          const nextBoard = makeMove(board, move);
          setBoard(nextBoard);
          setSelected(null);
          setCurrentPlayer((prev) => (prev === 'red' ? 'black' : 'red'));
          setMessage(`Moved ${piece ? 'piece' : 'to'} ${row + 1},${col + 1}`);
        }
      }
      return;
    }

    if (piece.color !== currentPlayer) {
      return;
    }

    if (selected && selected[0] === row && selected[1] === col) {
      setSelected(null);
      return;
    }

    setSelected([row, col]);
  };

  const makeAiMove = () => {
    if (mode !== 'ai' || currentPlayer !== 'black') {
      return;
    }

    const moves = getAllLegalMoves(board, 'black');
    if (moves.length === 0) {
      setMessage('No black moves available.');
      return;
    }

    const chosenMove = getRandomMove(moves);
    const nextBoard = makeMove(board, chosenMove);
    setBoard(nextBoard);
    setCurrentPlayer('red');
    setMessage('The AI moved. Your turn again.');
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('red');
    setSelected(null);
    setMessage('Game reset. Red starts.');
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'ai' ? 'pvp' : 'ai'));
    setMessage(mode === 'ai' ? 'Two-player mode enabled.' : 'Single-player mode enabled.');
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Checkers</h2>
          <p className="text-sm opacity-70">Play against a simple AI or a friend.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-outline" onClick={toggleMode}>
            {mode === 'ai' ? 'Switch to 2-player' : 'Switch to AI'}
          </button>
          <button className="btn btn-sm btn-primary" onClick={resetGame}>
            Reset
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="font-semibold">Turn:</span>
        <span className="badge badge-lg">{currentPlayer === 'red' ? 'Red' : 'Black'}</span>
        <span className="ml-2">{message}</span>
      </div>

      <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden border border-base-300">
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((__, col) => {
            const isDark = isDarkSquare(row, col);
            const piece = board[row][col];
            const isSelected = selected?.[0] === row && selected?.[1] === col;
            const canMove = selected ? getMovesForPiece(board, selected[0], selected[1]).some((move) => move.to.row === row && move.to.col === col) : false;

            return (
              <button
                key={`${row}-${col}`}
                className={`aspect-square border border-base-300 ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'} ${isSelected ? 'ring-4 ring-yellow-400' : ''} ${canMove ? 'outline outline-4 outline-green-500' : ''}`}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece ? (
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-white/20 text-xl font-bold text-white ${COLORS[piece.color]}`}>
                    {getPieceLabel(piece)}
                  </div>
                ) : null}
              </button>
            );
          }),
        )}
      </div>

      <div className="mt-4 text-sm opacity-80">
        <p>Rules: pieces move diagonally, jump over opponents, and become kings at the edge.</p>
        <p className="mt-1">The AI mode uses a simple random move picker so the game stays lightweight.</p>
      </div>
    </div>
  );
}
