export type Player = 'red' | 'black';

export interface Piece {
  color: Player;
  king: boolean;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Position;
}

const BOARD_SIZE = 8;

export function createInitialBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, col) => {
      if (row < 3 && (row + col) % 2 === 1) {
        return { color: 'black', king: false };
      }

      if (row > 4 && (row + col) % 2 === 1) {
        return { color: 'red', king: false };
      }

      return null;
    }),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getDirections(piece: Piece): number[] {
  if (piece.king) {
    return [-1, 1];
  }

  return piece.color === 'red' ? [1] : [-1];
}

export function getMovesForPiece(board: Board, row: number, col: number): Move[] {
  const piece = board[row][col];

  if (!piece) {
    return [];
  }

  const jumps: Move[] = [];
  const steps: Move[] = [];
  const directions = getDirections(piece);

  for (const rowDelta of directions) {
    for (const colDelta of [-1, 1]) {
      const nextRow = row + rowDelta;
      const nextCol = col + colDelta;

      if (!isInsideBoard(nextRow, nextCol)) {
        continue;
      }

      const target = board[nextRow][nextCol];

      if (!target) {
        steps.push({ from: { row, col }, to: { row: nextRow, col: nextCol } });
      }

      const jumpRow = row + rowDelta * 2;
      const jumpCol = col + colDelta * 2;
      const jumpedPiece = target;

      if (
        jumpedPiece &&
        jumpedPiece.color !== piece.color &&
        isInsideBoard(jumpRow, jumpCol) &&
        board[jumpRow][jumpCol] === null
      ) {
        jumps.push({
          from: { row, col },
          to: { row: jumpRow, col: jumpCol },
          captured: { row: nextRow, col: nextCol },
        });
      }
    }
  }

  return jumps.length > 0 ? jumps : steps;
}

export function getAllLegalMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell && cell.color === player) {
        moves.push(...getMovesForPiece(board, rowIndex, colIndex));
      }
    });
  });

  return moves;
}

export function makeMove(board: Board, move: Move): Board {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[move.from.row][move.from.col];

  if (!piece) {
    return nextBoard;
  }

  nextBoard[move.from.row][move.from.col] = null;
  nextBoard[move.to.row][move.to.col] = piece;

  if (move.captured) {
    nextBoard[move.captured.row][move.captured.col] = null;
  }

  if (
    !piece.king &&
    ((piece.color === 'red' && move.to.row === BOARD_SIZE - 1) ||
      (piece.color === 'black' && move.to.row === 0))
  ) {
    piece.king = true;
  }

  return nextBoard;
}
