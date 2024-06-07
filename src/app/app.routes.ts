import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ShiftsComponent } from "./pages/shifts/shifts.component";
import { NewShiftComponent } from "./pages/shifts/components/new-shift/new-shift.component";
import { LoginComponent } from "./pages/login/login.component";
import { RegisterComponent } from "./pages/register/register.component";
import { authGuard } from "./guards/auth.guard";
import { NotFoundComponent } from "./pages/not-found/not-found.component";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login page',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register page',
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home page',
    canActivate: [authGuard]
  },
  {
    path: 'shifts',
    component: ShiftsComponent,
    title: 'Shifts Page',
    canActivate: [authGuard]
  },
  {
    path: 'shifts',
    canActivate: [authGuard],
    children: [
      {
        path: 'newShift',
        component: NewShiftComponent
      },
      {
        path: '',
        redirectTo: 'shifts',
        pathMatch: 'full' // don't forget it
      }
    ]
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    title: 'Not Found Page'
  },
  {
    path: '**', redirectTo: '/not-found',
  }
]
