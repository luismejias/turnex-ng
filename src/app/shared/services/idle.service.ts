import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { fromEvent, merge, Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
  private _idle$ = new Subject<void>();
  readonly idle$ = this._idle$.asObservable();

  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _activitySub: Subscription | null = null;

  constructor(private ngZone: NgZone) {}

  start(): void {
    this._subscribeToActivity();
    this._resetTimer();
  }

  stop(): void {
    this._clearTimer();
    this._activitySub?.unsubscribe();
    this._activitySub = null;
  }

  reset(): void {
    this._resetTimer();
  }

  private _subscribeToActivity(): void {
    this._activitySub?.unsubscribe();
    const events$ = merge(
      ...ACTIVITY_EVENTS.map(ev => fromEvent(document, ev))
    ).pipe(throttleTime(500));

    this.ngZone.runOutsideAngular(() => {
      this._activitySub = events$.subscribe(() => this._resetTimer());
    });
  }

  private _resetTimer(): void {
    this._clearTimer();
    this.ngZone.runOutsideAngular(() => {
      this._timer = setTimeout(() => {
        this.ngZone.run(() => this._idle$.next());
      }, IDLE_TIMEOUT_MS);
    });
  }

  private _clearTimer(): void {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this._idle$.complete();
  }
}
