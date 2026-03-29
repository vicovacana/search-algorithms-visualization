import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, output } from '@angular/core';
import { MazeData } from '../models/maze.models';
import { Subject, Subscription } from 'rxjs';
import { Solution, Step } from '../models/solution.models';

@Component({
  selector: 'app-maze',
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './maze.html',
  styleUrl: './maze.scss',
})
export class Maze {
  @Input() mazeData!: MazeData;
  @Input() seeGenerateAnimation!: Subject<boolean>;
  @Input() seeSolutionAnimation!: Subject<Solution>;
  @Input() stopAnimations!: Subject<void>;
  @Input() userCurrentField!: Step;
  @Input() userOrComputer: 'user' | 'computer' = 'computer';
  @Input() userHistory!: Step[];

  animationInProgress = output<boolean>();
  cellClicked = output<Step>();

  generateAnimationGrid!: any[][];
  solveAnimationGrid!: any[][];
  startCell!: Step;
  endCell!: Step;

  seeGenerateAnimationSubscription!: Subscription;
  seeSolveAnimationSubscription!: Subscription;
  stopAnimationsSubscription!: Subscription;

  solution!: Solution;
  stopAnimationFlag = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const size = this.mazeData.grid.length;
    this.startCell = this.mazeData['start-cell'];
    this.endCell = this.mazeData['end-cell'];

    this.setAnimationGrid(size);

    if (this.seeGenerateAnimation) {
      this.seeGenerateAnimationSubscription = this.seeGenerateAnimation.subscribe((value) => {
        if (value) this.playGenerateAnimation();
      });
    }

    if (this.seeSolutionAnimation) {
      this.seeSolveAnimationSubscription = this.seeSolutionAnimation.subscribe((value) => {
        if (value) {
          this.solution = value;
          this.playSolutionAnimation();
        }
      });
    }

    if (this.stopAnimations) {
      this.stopAnimationsSubscription = this.stopAnimations.subscribe(() => {
        this.stopAnimationFlag = true;
        this.animationInProgress.emit(false);
        this.setMaze();
      });
    }

    this.setMaze();
  }

  setMaze() {
    this.generateAnimationGrid = this.generateAnimationGrid.map(() =>
      Array(this.generateAnimationGrid.length)
        .fill(null)
        .map(() => ({
          visited: true,
          colored: false,
        })),
    );

    this.solveAnimationGrid = this.solveAnimationGrid.map(() =>
      Array(this.generateAnimationGrid.length)
        .fill(null)
        .map(() => ({
          current: false,
          history: false,
          path: false,
        })),
    );
  }

  setAnimationGrid(size: number) {
    this.generateAnimationGrid = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            visited: false,
            colored: false,
          })),
      );

    this.solveAnimationGrid = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            current: false,
            history: false,
            path: false,
          })),
      );
  }

  async playGenerateAnimation() {
    this.stopAnimationFlag = false;
    this.animationInProgress.emit(true);
    this.generateAnimationGrid = this.generateAnimationGrid.map(() =>
      Array(this.generateAnimationGrid.length)
        .fill(null)
        .map(() => ({
          visited: false,
          colored: false,
        })),
    );

    this.solveAnimationGrid = this.solveAnimationGrid.map(() =>
      Array(this.generateAnimationGrid.length)
        .fill(null)
        .map(() => ({
          current: false,
          history: false,
          path: false,
        })),
    );

    let prevX;
    let prevY;
    for (const step of this.mazeData.history) {
      if (this.stopAnimationFlag) break;
      const [xFrom, yFrom] = step.from;
      const [xTo, yTo] = step.to;

      this.resetColoredStatus();
      this.generateAnimationGrid[xFrom][yFrom].colored = true;
      if (prevX && prevY) {
        this.generateAnimationGrid[prevX][prevY].visited = true;
      }

      this.cdr.detectChanges();
      await this.delay(100);

      if (this.stopAnimationFlag) break;
      this.resetColoredStatus();
      this.generateAnimationGrid[xTo][yTo].colored = true;

      this.generateAnimationGrid[xFrom][yFrom].visited = true;

      this.cdr.detectChanges();
      await this.delay(100);
      prevX = xTo;
      prevY = yTo;
    }

    if (this.stopAnimationFlag) return;
    this.animationInProgress.emit(false);
    this.generateAnimationGrid = this.generateAnimationGrid.map(() =>
      Array(this.generateAnimationGrid.length)
        .fill(null)
        .map(() => ({
          visited: true,
          colored: false,
        })),
    );
  }

  private resetColoredStatus() {
    for (let i = 0; i < this.generateAnimationGrid.length; i++) {
      for (let j = 0; j < this.generateAnimationGrid[i].length; j++) {
        this.generateAnimationGrid[i][j].colored = false;
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async playSolutionAnimation() {
    this.stopAnimationFlag = false;
    this.setMaze();
    this.animationInProgress.emit(true);

    for (const step of this.solution.history) {
      if (this.stopAnimationFlag) break;
      const [x, y] = step;

      this.resetCurrentStatus();

      if (this.solveAnimationGrid[x] && this.solveAnimationGrid[x][y]) {
        this.solveAnimationGrid[x][y].current = true;
      }

      this.cdr.detectChanges();
      await this.delay(300);

      if (this.stopAnimationFlag) return;
      if (this.solveAnimationGrid[x] && this.solveAnimationGrid[x][y]) {
        this.solveAnimationGrid[x][y].current = false;
        this.solveAnimationGrid[x][y].history = true;
      }
    }

    this.resetCurrentStatus();
    this.cdr.detectChanges();

    for (const step of this.solution.path) {
      if (this.stopAnimationFlag) break;
      const [x, y] = step;

      if (this.solveAnimationGrid[x] && this.solveAnimationGrid[x][y]) {
        this.solveAnimationGrid[x][y].path = true;
      }

      this.cdr.detectChanges();
      await this.delay(300);
    }

    if (this.stopAnimationFlag) return;
    this.animationInProgress.emit(false);
  }

  private resetCurrentStatus() {
    for (let i = 0; i < this.solveAnimationGrid.length; i++) {
      for (let j = 0; j < this.solveAnimationGrid[i].length; j++) {
        this.solveAnimationGrid[i][j].current = false;
      }
    }
  }

  findPathIndex(x: number, y: number) {
    return this.solution.path.findIndex((value) => value[0] === x && value[1] === y) + 1;
  }

  onCellClick(x: number, y: number) {
    this.cellClicked.emit([x, y]);
  }

  inHistory(x: number, y: number) {
    if (!this.userHistory) return false;

    return this.userHistory.some((step) => step[0] === x && step[1] === y);
  }

  ngOnDestroy() {
    this.seeGenerateAnimationSubscription?.unsubscribe();
    this.seeSolveAnimationSubscription?.unsubscribe();
    this.stopAnimationsSubscription?.unsubscribe();
  }
}
