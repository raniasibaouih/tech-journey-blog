"use client";

import { useEffect, useState } from 'react';
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

function isDarkSquare(row: number, col: number) {
  return (row + col) % 2 === 1;
}

function getPieceLabel(piece: { color: Player; king: boolean } | null) {
  if (!piece) return '';
  return piece.king ? '♛' : '•';
}

function getRandomMove(moves: Move[]) {
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function CheckersGame() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'pvp' | 'ai'>('ai');
  const [message, setMessage] = useState('Red starts. Pick a piece to move.');

  useEffect(() => {
    if (mode !== 'ai' || currentPlayer !== 'black') {
      return;
    }

    const timer = window.setTimeout(() => {
      const moves = getAllLegalMoves(board, 'black');
      if (moves.length === 0) {
        setMessage('Black has no moves. Red wins this round.');
        return;
      }

      const chosenMove = getRandomMove(moves);
      const nextBoard = makeMove(board, chosenMove);
      setBoard(nextBoard);
      setSelected(null);
      setCurrentPlayer('red');
      setMessage('The AI moved. Your turn again.');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [board, currentPlayer, mode]);

  const handleSquareClick = (row: number, col: number) => {
    if (currentPlayer === 'black' && mode === 'ai') {
      return;
    }

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
          setMessage(`Nice move. ${currentPlayer === 'red' ? 'Black' : 'Red'} is up next.`);
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

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('red');
    setSelected(null);
    setMessage('New game started. Red begins.');
  };

  const toggleMode = () => {
    const nextMode = mode === 'ai' ? 'pvp' : 'ai';
    setMode(nextMode);
    setMessage(nextMode === 'ai' ? 'AI mode on. Red begins.' : 'Two-player mode on. Red begins.');
  };

  return (
    <div className="w-full max-w-5xl rounded-[2rem] border border-base-300 bg-base-100/95 p-6 shadow-2xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Classic checkers</h2>
          <p className="text-sm opacity-70">A warm, simple board for a quick game.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-sm btn-outline" onClick={toggleMode}>
            {mode === 'ai' ? 'Switch to 2-player' : 'Switch to AI'}
          </button>
          <button className="btn btn-sm btn-primary" onClick={resetGame}>
            New game
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-base-200/80 px-4 py-3 text-sm">
        <span className="font-semibold">Turn:</span>
        <span className="badge badge-lg border-0 bg-primary text-primary-content">
          {currentPlayer === 'red' ? 'Red' : 'Black'}
        </span>
        <span className="opacity-80">{message}</span>
      </div>

      <div className="grid grid-cols-8 gap-0 overflow-hidden rounded-2xl border border-[#5f4633] shadow-inner">
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((__, col) => {
            const isDark = isDarkSquare(row, col);
            const piece = board[row][col];
            const isSelected = selected?.[0] === row && selected?.[1] === col;
            const canMove = selected
              ? getMovesForPiece(board, selected[0], selected[1]).some(
                  (move) => move.to.row === row && move.to.col === col,
                )
              : false;

            return (
              <button
                key={`${row}-${col}`}
                className={`aspect-square border border-[#6f533d] ${isDark ? 'bg-[#7c4f2c]' : 'bg-[#f3e0b5]'} ${isSelected ? 'ring-4 ring-amber-300' : ''} ${canMove ? 'shadow-[inset_0_0_0_4px_#4ade80]' : ''}`}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece ? (
                  <div
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-4 border-white/20 text-xl font-bold text-white shadow-lg ${piece.color === 'red' ? 'bg-red-600' : 'bg-neutral-800'}`}
                  >
                    {getPieceLabel(piece)}
                  </div>
                ) : null}
              </button>
            );
          }),
        )}
      </div>

      <div className="mt-5 rounded-xl border border-base-300 bg-base-200/70 p-4 text-sm leading-7 opacity-90">
        <p><span className="font-semibold">How to play:</span> move diagonally, capture by jumping, and crown a piece by reaching the far side.</p>
        <p className="mt-1">The AI uses a simple random move picker, so it feels light and quick to play.</p>
      </div>
    </div>
  );
}
