import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Maze } from '../maze/maze';
import { MazeData } from '../models/maze.models';
import { MOCK_MAZE } from '../maze/mock-maze';
import { Subject } from 'rxjs';

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
  animationInProgress: boolean = false;

  constructor() {
    this.mazeData = MOCK_MAZE;
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
}
