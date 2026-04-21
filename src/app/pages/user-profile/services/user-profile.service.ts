import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models';
import { AuthService } from 'src/app/shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private authService = inject(AuthService);

  getMe(): Observable<User> {
    return this.authService.getMe();
  }

  getDataUser(): User | null {
    return this.authService.getStoredUser();
  }
}
