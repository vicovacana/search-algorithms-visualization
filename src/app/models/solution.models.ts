export interface Solution {
  path: Step[];
  history: Step[];
}

export type Step = [number, number];
