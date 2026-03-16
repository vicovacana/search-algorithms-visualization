import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameWrapper } from './game-wrapper/game-wrapper';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameWrapper],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('search-algorithms-visualization');
}
