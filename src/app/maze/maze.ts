import { NgClass, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, Input, output } from '@angular/core';
import { MazeData } from '../models/maze.models';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-maze',
  imports: [NgFor, NgClass],
  templateUrl: './maze.html',
  styleUrl: './maze.scss',
})
export class Maze {
  @Input() mazeData!: MazeData;
  @Input() seeGenerateAnimation!: Subject<boolean>;
  animationInProgress = output<boolean>();

  animationGrid!: any[][];
  startCell!: any;
  endCell!: any;

  seeAnimationSubscription!: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const size = this.mazeData.grid.length;
    this.startCell = this.mazeData['start-cell'];
    this.endCell = this.mazeData['end-cell'];

    this.setAnimationGrid(size);

    if (this.seeGenerateAnimation) {
      this.seeAnimationSubscription = this.seeGenerateAnimation.subscribe((value) => {
        if (value) this.playAnimation();
      });
    }

    this.animationGrid = this.animationGrid.map(() =>
      Array(this.animationGrid.length)
        .fill(null)
        .map(() => ({
          visited: true,
          colored: false,
        })),
    );
  }

  setAnimationGrid(size: number) {
    this.animationGrid = Array(size)
      .fill(null)
      .map(() =>
        Array(size).fill({
          visited: false,
          colored: false,
        }),
      );
  }

  async playAnimation() {
    this.animationGrid = this.animationGrid.map(() =>
      Array(this.animationGrid.length)
        .fill(null)
        .map(() => ({
          visited: false,
          colored: false,
        })),
    );

    this.animationInProgress.emit(true);

    let prevX;
    let prevY;
    for (const step of this.mazeData.history) {
      const [xFrom, yFrom] = step.from;
      const [xTo, yTo] = step.to;

      this.resetColoredStatus();
      this.animationGrid[xFrom][yFrom].colored = true;
      if (prevX && prevY) {
        this.animationGrid[prevX][prevY].visited = true;
      }

      this.cdr.detectChanges();
      await this.delay(100);

      this.resetColoredStatus();
      this.animationGrid[xTo][yTo].colored = true;

      this.animationGrid[xFrom][yFrom].visited = true;

      this.cdr.detectChanges();
      await this.delay(100);
      prevX = xTo;
      prevY = yTo;
    }

    this.animationInProgress.emit(false);
  }

  private resetColoredStatus() {
    for (let i = 0; i < this.animationGrid.length; i++) {
      for (let j = 0; j < this.animationGrid[i].length; j++) {
        this.animationGrid[i][j].colored = false;
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ngOnDestroy() {
    this.seeAnimationSubscription?.unsubscribe();
  }
}
