import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Maze } from '../maze/maze';
import { MazeData } from '../models/maze.models';
import { MOCK_MAZE } from '../maze/mock-maze';
import { Subject, Subscription } from 'rxjs';
import { CallBroker } from '../services/call-broker';
import { Solution, Step } from '../models/solution.models';

@Component({
  selector: 'app-game',
  imports: [NgIf, Maze],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game {
  selectedAlgorithm: 'A*' | null = null;
  theoryOrTips: 'theory' | 'tips' = 'theory';
  mazeData!: MazeData;
  seeGenerateAnimation: Subject<boolean> = new Subject<boolean>();
  seeSolutionAnimation: Subject<Solution> = new Subject<Solution>();

  stopAnimations: Subject<void> = new Subject<void>();
  animationInProgress: boolean = false;

  getMazeSubscription!: Subscription;
  solveMazeSubscription!: Subscription;

  algorithmsMap = {
    'A*': 'a-star',
  };

  solution!: Solution;
  userHistory!: Step[];
  userCurrentStep!: Step;

  constructor(private callBroker: CallBroker) {}

  ngOnInit() {
    this.getMaze();
  }

  selectAlgorithm(selected: 'A*' | null) {
    this.selectedAlgorithm = selected;
  }

  selectLearningType(selected: 'theory' | 'tips') {
    this.theoryOrTips = selected;
  }

  playAnimation() {
    this.seeGenerateAnimation.next(true);
  }

  handleStatus(status: boolean) {
    this.animationInProgress = status;
  }

  getMaze() {
    this.getMazeSubscription = this.callBroker.getMaze().subscribe(
      (result) => {
        this.mazeData = result;
        this.userCurrentStep = this.mazeData['start-cell'];
      },
      (error) => {
        console.log(error);
      },
    );
  }

  solveMaze() {
    if (!this.selectedAlgorithm) {
      return;
    }
    const alg = this.algorithmsMap[this.selectedAlgorithm];

    const data = {
      grid: this.mazeData.grid,
      'start-cell': this.mazeData['start-cell'],
      'end-cell': this.mazeData['end-cell'],
      algorithm: alg,
    };

    this.solveMazeSubscription = this.callBroker.solveMaze(data).subscribe(
      (result) => {
        this.solution = result;
        this.seeSolutionAnimation.next(this.solution);
      },
      (error) => {
        console.log(error);
      },
    );
  }

  stopAnimation() {
    this.stopAnimations.next();
  }

  ngOnDestroy() {
    this.getMazeSubscription?.unsubscribe;
    this.solveMazeSubscription?.unsubscribe;
  }
}
