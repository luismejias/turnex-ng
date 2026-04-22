import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

const COUNTDOWN_SECONDS = 60;

@Component({
  selector: 'turnex-idle-modal',
  imports: [MatDialogModule],
  templateUrl: './idle-modal.component.html',
  styleUrl: './idle-modal.component.scss',
})
export class IdleModalComponent implements OnInit, OnDestroy {
  dialogRef = inject(MatDialogRef<IdleModalComponent>);

  countdown = COUNTDOWN_SECONDS;
  private _interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this._interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) this._autoLogout();
    }, 1000);
  }

  stay(): void {
    this.dialogRef.close('stay');
  }

  logout(): void {
    this.dialogRef.close('logout');
  }

  private _autoLogout(): void {
    this.dialogRef.close('logout');
  }

  ngOnDestroy(): void {
    if (this._interval !== null) clearInterval(this._interval);
  }
}
