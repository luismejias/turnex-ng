import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _counter = signal(0);
  readonly isLoading = computed(() => this._counter() > 0);

  show(): void { this._counter.update(n => n + 1); }
  hide(): void { this._counter.update(n => Math.max(0, n - 1)); }
}
