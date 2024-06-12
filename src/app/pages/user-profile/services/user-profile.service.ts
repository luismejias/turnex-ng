import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/models';
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly _http = inject(HttpClient);
  users: User[] = [];
  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getUser(userReceived: string): User | undefined {
    const users = localStorage.getItem('users');
    this.users = users ? JSON.parse(users) : [];
    const userAux = this.users ? this.users.find((user) => (user.email === userReceived)) : undefined;
    return userAux;
  }

  saveUser(user: User) {
    if(!this.getUser(user.email)){
      this.users.push(user);
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }

  getDataUser() {
    return JSON.parse(localStorage.getItem('user') || '');
  }
}
