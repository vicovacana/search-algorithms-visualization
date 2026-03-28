import { Routes } from '@angular/router';
import { Start } from './start/start';
import { Game } from './game/game';

export const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', component: Start },
  { path: 'game', component: Game },
  { path: '**', redirectTo: 'start' },
];
