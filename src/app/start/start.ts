import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  imports: [],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
  constructor(private router: Router) {}

  getStarted() {
    this.router.navigate(['/game']);
  }
}
