import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Maze } from '../maze/maze';
import { MazeData } from '../models/maze.models';
import { MOCK_MAZE } from '../maze/mock-maze';
import { Subject, Subscription } from 'rxjs';
import { CallBroker } from '../services/call-broker';
import { Solution, Step } from '../models/solution.models';
import { MatDialog } from '@angular/material/dialog';
import { FinishModal } from '../finish-modal/finish-modal';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-game',
  imports: [NgIf, Maze, AngularSvgIconModule],
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
  userHistory: Step[] = [];
  userCurrentStep!: Step;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.userCurrentStep || this.animationInProgress) return;

    const [x, y] = this.userCurrentStep;
    const currentCell = this.mazeData.grid[x][y];

    let newX = x;
    let newY = y;
    let moved = false;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowUp':
        if (!currentCell.walls.n) {
          if (newX === this.mazeData['end-cell'][0] && newY === this.mazeData['end-cell'][1]) {
            return;
          }
          newX = x - 1;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (newX === this.mazeData['start-cell'][0] && newY === this.mazeData['start-cell'][1]) {
          return;
        }
        if (!currentCell.walls.s) {
          newX = x + 1;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (!currentCell.walls.w) {
          newY = y - 1;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (!currentCell.walls.e) {
          newY = y + 1;
          moved = true;
        }
        break;
    }

    if (moved) {
      this.updateUserPosition(newX, newY);
    }
  }

  constructor(
    private callBroker: CallBroker,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

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
        this.userHistory.push(this.userCurrentStep);
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

  clearUserMaze() {
    this.userHistory = [this.mazeData['start-cell']];
    this.userCurrentStep = this.mazeData['start-cell'];
  }

  updateUserPosition(x: number, y: number) {
    this.userCurrentStep = [x, y];
    this.userHistory.push([x, y]);

    this.cdr.detectChanges();

    if (x === this.mazeData['end-cell'][0] && y === this.mazeData['end-cell'][1]) {
      this.openFinishModal();
    }
  }

  onCellClick(c: [number, number]) {
    if (this.animationInProgress) return;
    const [x, y] = c;

    const lastElIndex = this.userHistory.length - 1;
    const lastEl = this.userHistory[lastElIndex];

    if (lastEl && lastEl[0] === x && lastEl[1] === y) return;

    this.updateUserPosition(x, y);
  }

  openFinishModal() {
    const dialogRef = this.dialog.open(FinishModal, {
      width: '500px',
      panelClass: 'retro-modal',
      disableClose: false,
    });
  }

  ngOnDestroy() {
    this.getMazeSubscription?.unsubscribe;
    this.solveMazeSubscription?.unsubscribe;
  }
}
