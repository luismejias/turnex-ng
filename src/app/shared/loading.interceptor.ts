import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './services/loading.service';

const SKIP_HEADER = 'X-Skip-Loading';
const DEBOUNCE_MS = 400;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has(SKIP_HEADER)) {
    return next(req.clone({ headers: req.headers.delete(SKIP_HEADER) }));
  }

  const loadingService = inject(LoadingService);
  let shown = false;

  const timer = setTimeout(() => {
    shown = true;
    loadingService.show();
  }, DEBOUNCE_MS);

  return next(req).pipe(
    finalize(() => {
      clearTimeout(timer);
      if (shown) loadingService.hide();
    })
  );
};
