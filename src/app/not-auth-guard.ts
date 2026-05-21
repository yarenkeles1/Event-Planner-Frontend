import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';

export const notAuthGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get('http://localhost:8081/event/control', {
    withCredentials: true
  }).pipe(
    map(() => {
      router.navigate(['/events']);
      return false;
    }),
    catchError(() => of(true))
  );
};