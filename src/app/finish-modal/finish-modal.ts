import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-finish-modal',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './finish-modal.html',
  styleUrl: './finish-modal.scss',
})
export class FinishModal {
  constructor(public dialogRef: MatDialogRef<FinishModal>) {}
}
