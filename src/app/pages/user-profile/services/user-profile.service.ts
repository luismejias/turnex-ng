import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/models';
const users: User[] =[
  {
    id: 1,
    name: 'Luis',
    lastName: 'Mejias',
    password: '123456',
    email: 'luis@gmail.com',
    active: true,
    termAndConditions: true,
  },
  {
    id: 2,
    name: 'Sonely',
    lastName: 'Urdaneta',
    password: '123456',
    email: 'sonely@gmail.com',
    active: true,
    termAndConditions: true,
  }
]
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly _http = inject(HttpClient);
  users: User[] = users;

  getUsers(): Observable<User[]>{
    return of(users);
  }

  getUser(userReceived: string, password: string): Observable<User | undefined>{
    const userAux = this.users.find((user)=> (user.email === userReceived) && (user.password === password));
    return of(userAux);
  }

  saveUser(user: User) {
    this.users.push(user);
    console.log('USERS ===>  ', this.users);

  }

  getDataUser() {
    return JSON.parse(localStorage.getItem('user') || '');
  }
}
