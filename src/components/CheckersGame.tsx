"use client";

import { useEffect, useMemo, useState } from "react";

type Player = 1 | 2;
type Piece = { player: Player; king: boolean };
type Cell = Piece | null;
type MoveOption = { x: number; y: number; captures: Array<{ x: number; y: number }> };
type Mode = "1P" | "2P";

const BOARD_SIZE = 8;

const createBoard = (): Cell[][] => {
  const board: Cell[][] = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));

  const placePiece = (row: number, col: number, player: Player) => {
    if ((row + col) % 2 === 1) {
      board[row][col] = { player, king: false };
    }
  };

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      placePiece(row, col, 2);
    }
  }

  for (let row = 5; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      placePiece(row, col, 1);
    }
  }

  return board;
};

const copyBoard = (board: Cell[][]) => board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

const isInBounds = (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

const getDirectionVectors = (piece: Piece) => {
  if (piece.king) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const;
  }

  return piece.player === 1 ? ([[-1, -1], [-1, 1]] as const) : ([1, -1], [1, 1]) as const;
};

const getPieceMoves = (board: Cell[][], x: number, y: number): MoveOption[] => {
  const piece = board[x][y];
  if (!piece) {
    return [];
  }

  const deltas = getDirectionVectors(piece);
  const captures: MoveOption[] = [];
  const quietMoves: MoveOption[] = [];

  deltas.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    const jumpX = nx + dx;
    const jumpY = ny + dy;

    if (!isInBounds(nx, ny)) return;

    const target = board[nx][ny];

    if (!target) {
      quietMoves.push({ x: nx, y: ny, captures: [] });
      return;
    }

    if (target.player !== piece.player && isInBounds(jumpX, jumpY) && !board[jumpX][jumpY]) {
      captures.push({ x: jumpX, y: jumpY, captures: [{ x: nx, y: ny }] });
    }
  });

  if (captures.length > 0) {
    return captures;
  }

  return quietMoves;
};

const getAllMoves = (board: Cell[][], player: Player) => {
  const all: { fromX: number; fromY: number; move: MoveOption }[] = [];
  const captureMoves: { fromX: number; fromY: number; move: MoveOption }[] = [];

  for (let x = 0; x < BOARD_SIZE; x += 1) {
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      const piece = board[x][y];
      if (!piece || piece.player !== player) continue;
      const moves = getPieceMoves(board, x, y);
      moves.forEach((move) => {
        if (move.captures.length > 0) {
          captureMoves.push({ fromX: x, fromY: y, move });
        } else {
          all.push({ fromX: x, fromY: y, move });
        }
      });
    }
  }

  return captureMoves.length > 0 ? captureMoves : all;
};

const promotePiece = (piece: Piece, x: number) => {
  if (!piece.king && ((piece.player === 1 && x === 0) || (piece.player === 2 && x === BOARD_SIZE - 1))) {
    return { ...piece, king: true };
  }
  return piece;
};

const hasCapture = (board: Cell[][], x: number, y: number) => {
  const piece = board[x][y];
  if (!piece) return false;
  return getPieceMoves(board, x, y).some((move) => move.captures.length > 0);
};

const randomChoice = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const playerName = (player: Player) => (player === 1 ? "Red" : "Black");

const getMoveLabel = (move: MoveOption) => {
  if (move.captures.length > 0) {
    return "jump";
  }
  return "move";
};

const formatCoordinates = (x: number, y: number) => `${String.fromCharCode(65 + y)}${BOARD_SIZE - x}`;

export default function CheckersGame() {
  const [board, setBoard] = useState<Cell[][]>(() => createBoard());
  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [mode, setMode] = useState<Mode>("1P");
  const [showGuides, setShowGuides] = useState(true);
  const [status, setStatus] = useState("Choose a mode and make your first move.");

  const allMoves = useMemo(() => getAllMoves(board, currentPlayer), [board, currentPlayer]);

  const selectedMoves = useMemo(() => {
    if (!selected) return [];
    const piece = board[selected.x][selected.y];
    if (!piece || piece.player !== currentPlayer) return [];
    const moves = getPieceMoves(board, selected.x, selected.y);
    const captureActive = allMoves.some(({ move }) => move.captures.length > 0);
    return captureActive ? moves.filter((move) => move.captures.length > 0) : moves;
  }, [board, selected, currentPlayer, allMoves]);

  const gameOver = allMoves.length === 0;

  const clearSelection = () => setSelected(null);

  const applyMove = (fromX: number, fromY: number, move: MoveOption) => {
    const nextBoard = copyBoard(board);
    const piece = nextBoard[fromX][fromY];
    if (!piece) return;

    nextBoard[fromX][fromY] = null;
    const promoted = promotePiece(piece, move.x);
    nextBoard[move.x][move.y] = promoted;
    move.captures.forEach((capture) => {
      nextBoard[capture.x][capture.y] = null;
    });

    const nextMoves = getPieceMoves(nextBoard, move.x, move.y);
    const hasChain = move.captures.length > 0 && nextMoves.some((candidate) => candidate.captures.length > 0);

    if (hasChain) {
      setBoard(nextBoard);
      setSelected({ x: move.x, y: move.y });
      setStatus(`${playerName(currentPlayer)} captured and can jump again!`);
      return;
    }

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setBoard(nextBoard);
    setSelected(null);
    setCurrentPlayer(nextPlayer);
    setStatus(`${playerName(nextPlayer)}'s turn.`);
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameOver) {
      setStatus(`Game over. ${playerName(currentPlayer === 1 ? 2 : 1)} wins!`);
      return;
    }

    if (mode === "1P" && currentPlayer === 2) {
      return;
    }

    const cell = board[x][y];
    const move = selectedMoves.find((option) => option.x === x && option.y === y);

    if (selected && move) {
      applyMove(selected.x, selected.y, move);
      return;
    }

    if (cell && cell.player === currentPlayer) {
      setSelected({ x, y });
      setStatus(`Selected ${playerName(currentPlayer)} piece at ${formatCoordinates(x, y)}.`);
      return;
    }

    if (selected) {
      setStatus("That move is not allowed. Select a highlighted square or another piece.");
      return;
    }

    setStatus(`It's ${playerName(currentPlayer)}'s turn. Select a piece.`);
  };

  const performAIMove = () => {
    if (mode !== "1P" || currentPlayer !== 2 || gameOver) return;

    const moves = allMoves;
    if (moves.length === 0) {
      return;
    }

    const aiChoice = randomChoice(moves);
    applyMove(aiChoice.fromX, aiChoice.fromY, aiChoice.move);
  };

  useEffect(() => {
    if (mode === "1P" && currentPlayer === 2 && !gameOver) {
      const timeout = setTimeout(() => performAIMove(), 400);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [board, currentPlayer, mode, gameOver]);

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    setSelected(null);
    setStatus("Choose a mode and make your first move.");
  };

  const modeLabel = mode === "1P" ? "Single player" : "Two player";
  const borderMessage = gameOver ? `${playerName(currentPlayer === 1 ? 2 : 1)} wins!` : `${playerName(currentPlayer)} to move.`;

  return (
    <section className="checkers-shell">
      <div className="checkers-card">
        <div className="checkers-header">
          <div>
            <p className="eyebrow">Welcome to Friendly Checkers</p>
            <h2>Play a classic board game with clear guidance and polished visuals.</h2>
          </div>
          <div className="mode-control">
            <button type="button" className={mode === "1P" ? "active" : ""} onClick={() => { setMode("1P"); resetGame(); }}>
              1 Player
            </button>
            <button type="button" className={mode === "2P" ? "active" : ""} onClick={() => { setMode("2P"); resetGame(); }}>
              2 Player
            </button>
          </div>
        </div>

        <div className="checkers-status-bar">
          <div>
            <strong>Mode:</strong> {modeLabel}
          </div>
          <div>
            <strong>Status:</strong> {status}
          </div>
          <div>
            <strong>Next:</strong> {borderMessage}
          </div>
        </div>

        <div className="checkers-controls">
          <button type="button" onClick={resetGame}>
            Restart game
          </button>
          <button type="button" onClick={() => setShowGuides((value) => !value)}>
            {showGuides ? "Hide move guidance" : "Show move guidance"}
          </button>
        </div>

        <div className="board-and-hints">
          <div className="board" role="grid" aria-label="Checkers board">
            {board.map((row, x) =>
              row.map((cell, y) => {
                const isDark = (x + y) % 2 === 1;
                const isSelected = selected?.x === x && selected?.y === y;
                const canMoveHere = selectedMoves.some((option) => option.x === x && option.y === y);
                const isHighlight = showGuides && canMoveHere;

                return (
                  <button
                    type="button"
                    key={`${x}-${y}`}
                    className={["board-cell", isDark ? "dark" : "light", isSelected ? "selected" : "", isHighlight ? "highlight" : ""].join(" ")}
                    onClick={() => handleCellClick(x, y)}
                    aria-label={cell ? `${playerName(cell.player)} ${cell.king ? "king" : "piece"} at ${formatCoordinates(x, y)}` : `${formatCoordinates(x, y)} square`}
                  >
                    {cell ? (
                      <div className={"piece " + (cell.player === 1 ? "piece-red" : "piece-black") + (cell.king ? " king" : "")}> 
                        {cell.king ? "♛" : ""}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          <div className="checkers-hints">
            <h3>How to play</h3>
            <p>Click a {playerName(currentPlayer)} piece to see its legal moves. Highlighted squares show where the selected piece can go.</p>
            <p>Capture moves are mandatory and are automatically prioritized when available.</p>
            <p>In single player mode, the AI will play Black.</p>
            {selected ? (
              <p>
                Selected piece: <strong>{formatCoordinates(selected.x, selected.y)}</strong>
              </p>
            ) : (
              <p>Select a piece to see available moves.</p>
            )}
            <div className="hint-box">
              <strong>Tip:</strong> Kings move forwards and backwards. Reach the opposite side to crown a piece.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
