"use client";

import { useEffect, useMemo, useState } from "react";

type Player = 1 | 2;
type Piece = { player: Player; king: boolean };
type Cell = Piece | null;
type Coord = { x: number; y: number };
type MoveOption = { to: Coord; captures: Coord[] };
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
const inBounds = (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

const playerName = (player: Player) => (player === 1 ? "Red" : "Black");
const formatCoordinates = (x: number, y: number) => `${String.fromCharCode(65 + y)}${BOARD_SIZE - x}`;

const promotePiece = (piece: Piece, x: number) => {
  if (!piece.king && ((piece.player === 1 && x === 0) || (piece.player === 2 && x === BOARD_SIZE - 1))) {
    return { ...piece, king: true };
  }
  return piece;
};

const getDirections = (piece: Piece) => {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ] as const;
  }

  return piece.player === 1
    ? ([
        [-1, -1],
        [-1, 1],
      ] as const)
    : ([
        [1, -1],
        [1, 1],
      ] as const);
};

const buildCaptureMoves = (board: Cell[][], x: number, y: number, piece: Piece): MoveOption[] => {
  const directions = getDirections(piece);
  const captures: MoveOption[] = [];

  directions.forEach(([dx, dy]) => {
    const enemyX = x + dx;
    const enemyY = y + dy;
    const landingX = x + dx * 2;
    const landingY = y + dy * 2;

    if (!inBounds(enemyX, enemyY) || !inBounds(landingX, landingY)) {
      return;
    }

    const enemy = board[enemyX][enemyY];
    const landing = board[landingX][landingY];

    if (!enemy || enemy.player === piece.player || landing) {
      return;
    }

    const nextBoard = copyBoard(board);
    nextBoard[x][y] = null;
    nextBoard[enemyX][enemyY] = null;
    const promoted = promotePiece(piece, landingX);
    nextBoard[landingX][landingY] = promoted;

    const followUpMoves = buildCaptureMoves(nextBoard, landingX, landingY, promoted);

    if (followUpMoves.length > 0) {
      followUpMoves.forEach((followUp) => {
        captures.push({
          to: followUp.to,
          captures: [{ x: enemyX, y: enemyY }, ...followUp.captures],
        });
      });
    } else {
      captures.push({
        to: { x: landingX, y: landingY },
        captures: [{ x: enemyX, y: enemyY }],
      });
    }
  });

  return captures;
};

const getPieceMoves = (board: Cell[][], x: number, y: number): MoveOption[] => {
  const piece = board[x][y];
  if (!piece) {
    return [];
  }

  const captures = buildCaptureMoves(board, x, y, piece);
  if (captures.length > 0) {
    return captures;
  }

  const quietMoves: MoveOption[] = [];
  getDirections(piece).forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!inBounds(nx, ny)) {
      return;
    }
    if (!board[nx][ny]) {
      quietMoves.push({ to: { x: nx, y: ny }, captures: [] });
    }
  });

  return quietMoves;
};

const getAllMoves = (board: Cell[][], player: Player) => {
  const all: { fromX: number; fromY: number; move: MoveOption }[] = [];
  const captureMoves: { fromX: number; fromY: number; move: MoveOption }[] = [];

  for (let x = 0; x < BOARD_SIZE; x += 1) {
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      const piece = board[x][y];
      if (!piece || piece.player !== player) {
        continue;
      }

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

const applyMoveToBoard = (board: Cell[][], fromX: number, fromY: number, move: MoveOption) => {
  const nextBoard = copyBoard(board);
  const piece = nextBoard[fromX][fromY];
  if (!piece) {
    return nextBoard;
  }

  nextBoard[fromX][fromY] = null;
  const promoted = promotePiece(piece, move.to.x);
  nextBoard[move.to.x][move.to.y] = promoted;
  move.captures.forEach((capture) => {
    nextBoard[capture.x][capture.y] = null;
  });

  return nextBoard;
};

const evaluateBoard = (board: Cell[][], perspective: Player) => {
  let score = 0;

  for (let x = 0; x < BOARD_SIZE; x += 1) {
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      const piece = board[x][y];
      if (!piece) {
        continue;
      }

      const value = piece.king ? 4 : 1;
      const promotionBias = piece.player === 1 ? BOARD_SIZE - 1 - x : x;
      const centerBias = (x === 3 || x === 4) && (y === 3 || y === 4) ? 0.5 : 0;
      const pieceScore = value + promotionBias * 0.05 + centerBias;

      score += piece.player === perspective ? pieceScore : -pieceScore;
    }
  }

  return score;
};

type AIMoveChoice = { fromX: number; fromY: number; move: MoveOption };

const chooseAIMove = (board: Cell[][], player: Player, depth: number): AIMoveChoice | null => {
  const moves = getAllMoves(board, player);
  if (moves.length === 0) {
    return null;
  }

  const search = (currentBoard: Cell[][], currentPlayer: Player, remainingDepth: number, alpha: number, beta: number): number => {
    const currentMoves = getAllMoves(currentBoard, currentPlayer);
    if (currentMoves.length === 0) {
      return remainingDepth === depth ? 0 : -100000 + (depth - remainingDepth);
    }

    if (remainingDepth === 0) {
      return evaluateBoard(currentBoard, player);
    }

    const maximizing = currentPlayer === player;
    let bestValue = maximizing ? -Infinity : Infinity;

    currentMoves.forEach(({ fromX, fromY, move }) => {
      const nextBoard = applyMoveToBoard(currentBoard, fromX, fromY, move);
      const nextPlayer = currentPlayer === 1 ? 2 : 1;
      const value = search(nextBoard, nextPlayer, remainingDepth - 1, alpha, beta);

      if (maximizing) {
        bestValue = Math.max(bestValue, value);
        alpha = Math.max(alpha, value);
      } else {
        bestValue = Math.min(bestValue, value);
        beta = Math.min(beta, value);
      }

      if (beta <= alpha) {
        return;
      }
    });

    return bestValue;
  };

  let bestChoice: { fromX: number; fromY: number; move: MoveOption } | null = null;
  let bestValue = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  moves.forEach((entry) => {
    const nextBoard = applyMoveToBoard(board, entry.fromX, entry.fromY, entry.move);
    const value = search(nextBoard, player === 1 ? 2 : 1, depth - 1, alpha, beta);
    if (value > bestValue) {
      bestValue = value;
      bestChoice = entry;
      alpha = Math.max(alpha, value);
    }
  });

  return bestChoice;
};

export default function CheckersGame() {
  const [board, setBoard] = useState<Cell[][]>(() => createBoard());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [mode, setMode] = useState<Mode>("1P");
  const [showGuides, setShowGuides] = useState(true);
  const [status, setStatus] = useState("Red begins. Capture pieces and crown your king.");
  const [moveCount, setMoveCount] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);

  const allMoves = useMemo(() => getAllMoves(board, currentPlayer), [board, currentPlayer]);

  const selectedMoves = useMemo(() => {
    if (!selected) {
      return [];
    }

    const piece = board[selected.x][selected.y];
    if (!piece || piece.player !== currentPlayer) {
      return [];
    }

    const moves = getPieceMoves(board, selected.x, selected.y);
    const captureActive = allMoves.some(({ move }) => move.captures.length > 0);
    return captureActive ? moves.filter((move) => move.captures.length > 0) : moves;
  }, [board, selected, currentPlayer, allMoves]);

  const gameOver = allMoves.length === 0;
  const redPieces = useMemo(() => board.flat().filter((cell) => cell?.player === 1).length, [board]);
  const blackPieces = useMemo(() => board.flat().filter((cell) => cell?.player === 2).length, [board]);

  const applyMove = (fromX: number, fromY: number, move: MoveOption) => {
    const nextBoard = applyMoveToBoard(board, fromX, fromY, move);
    const piece = board[fromX][fromY];
    if (!piece) {
      return;
    }

    const movedPiece = nextBoard[move.to.x][move.to.y];
    const canContinue = move.captures.length > 0 && getPieceMoves(nextBoard, move.to.x, move.to.y).some((candidate) => candidate.captures.length > 0);

    if (canContinue && movedPiece) {
      setBoard(nextBoard);
      setSelected({ x: move.to.x, y: move.to.y });
      setStatus(`${playerName(currentPlayer)} must continue the capture chain.`);
      return;
    }

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setBoard(nextBoard);
    setSelected(null);
    setCurrentPlayer(nextPlayer);
    setMoveCount((value) => value + 1);
    setAiThinking(false);
    setStatus(gameOver ? `${playerName(nextPlayer)} has no moves. ${playerName(currentPlayer)} wins!` : `${playerName(nextPlayer)}'s turn.`);
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameOver) {
      setStatus(`${playerName(currentPlayer === 1 ? 2 : 1)} wins the match.`);
      return;
    }

    if (mode === "1P" && currentPlayer === 2) {
      return;
    }

    const cell = board[x][y];
    const move = selectedMoves.find((option) => option.to.x === x && option.to.y === y);

    if (selected && move) {
      applyMove(selected.x, selected.y, move);
      return;
    }

    if (cell && cell.player === currentPlayer) {
      setSelected({ x, y });
      setStatus(`${playerName(currentPlayer)} selected ${formatCoordinates(x, y)}.`);
      return;
    }

    if (selected) {
      setStatus("That move is not allowed. Choose a highlighted square or another piece.");
      return;
    }

    setStatus(`It is ${playerName(currentPlayer)}'s turn. Select a piece.`);
  };

  const performAIMove = () => {
    if (mode !== "1P" || currentPlayer !== 2 || gameOver) {
      return;
    }

    setAiThinking(true);
    setStatus("Black is thinking...");

    window.setTimeout(() => {
      const aiChoice: { fromX: number; fromY: number; move: MoveOption } | null = chooseAIMove(board, 2, 4);
      if (!aiChoice) {
        setAiThinking(false);
        setStatus("Black has no legal moves. Red wins!");
        setCurrentPlayer(1);
        return;
      }

      applyMove(aiChoice.fromX, aiChoice.fromY, aiChoice.move);
      setAiThinking(false);
    }, 650);
  };

  useEffect(() => {
    if (mode === "1P" && currentPlayer === 2 && !gameOver) {
      const timeout = window.setTimeout(() => performAIMove(), 550);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [board, currentPlayer, mode, gameOver]);

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    setSelected(null);
    setMoveCount(0);
    setAiThinking(false);
    setStatus("Red begins. Capture pieces and crown your king.");
  };

  const modeLabel = mode === "1P" ? "Single player" : "Two player";
  const turnBadge = gameOver ? `${playerName(currentPlayer === 1 ? 2 : 1)} wins!` : `${playerName(currentPlayer)} to move`;
  const turnTone = currentPlayer === 1 ? "turn-red" : "turn-black";

  return (
    <section className="checkers-shell">
      <div className="checkers-card">
        <div className="checkers-header">
          <div>
            <p className="eyebrow">Elegant, strategic checkers</p>
            <h2>Play a polished board game with classic rules and modern flair.</h2>
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
          <div className={`turn-pill ${turnTone}`}>
            <strong>Turn:</strong> {turnBadge}
            {aiThinking && mode === "1P" && currentPlayer === 2 ? " • Black is thinking" : ""}
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
          <div className="board-board">
            <div className="board-labels board-labels-top">
              {Array.from({ length: BOARD_SIZE }, (_, index) => (
                <span key={`top-${index}`}>{String.fromCharCode(65 + index)}</span>
              ))}
            </div>
            <div className="board" role="grid" aria-label="Checkers board">
              {board.map((row, x) =>
                row.map((cell, y) => {
                  const isDark = (x + y) % 2 === 1;
                  const isSelected = selected?.x === x && selected?.y === y;
                  const canMoveHere = selectedMoves.some((option) => option.to.x === x && option.to.y === y);
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
                        <div className={["piece", cell.player === 1 ? "piece-red" : "piece-black", cell.king ? "king" : ""].join(" ")}>
                          {cell.king ? "♛" : ""}
                        </div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
            <div className="board-labels board-labels-bottom">
              {Array.from({ length: BOARD_SIZE }, (_, index) => (
                <span key={`bottom-${index}`}>{BOARD_SIZE - index}</span>
              ))}
            </div>
          </div>

          <div className="checkers-hints">
            <h3>How to play</h3>
            <p>Click a piece to reveal its legal moves. Highlighted squares show the destination for your current selection.</p>
            <p>Captures are mandatory and may chain across the board when you jump again from the landing square.</p>
            <p>In single-player mode, the AI plays Black and uses a thoughtful strategy engine.</p>
            <div className="stat-grid">
              <div>
                <span className="stat-label">Red pieces</span>
                <strong>{redPieces}</strong>
              </div>
              <div>
                <span className="stat-label">Black pieces</span>
                <strong>{blackPieces}</strong>
              </div>
              <div>
                <span className="stat-label">Moves</span>
                <strong>{moveCount}</strong>
              </div>
            </div>
            <div className="hint-box">
              <strong>Tip:</strong> Regular pieces move diagonally toward the opponent and become kings when they reach the far edge.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
