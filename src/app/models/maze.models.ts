export interface Cell {
  'visited?': boolean;
  walls: {
    n: boolean;
    e: boolean;
    s: boolean;
    w: boolean;
  };
}

export interface Move {
  from: [number, number];
  to: [number, number];
}

export interface MazeData {
  grid: Cell[][];
  'start-cell': [number, number];
  'end-cell': [number, number];
  history: Move[];
}
