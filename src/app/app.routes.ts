import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ShiftsComponent } from "./pages/shifts/shifts.component";
import { NewShiftComponent } from "./pages/shifts/components/new-shift/new-shift.component";
import { LoginComponent } from "./pages/login/login.component";
import { RegisterComponent } from "./pages/register/register.component";

export const routes: Routes =[
  {
    path: 'login', component: LoginComponent, title: 'Login page',
  },
  {
    path: 'register', component: RegisterComponent, title: 'Register page',
  },
  {
    path: 'home', component: HomeComponent, title: 'Home page',
  },
  {
    path: 'shifts', component: ShiftsComponent, title: 'Shifts Page'
  },
  {
    path: 'shifts',
    children: [
      { path: 'newShift', component: NewShiftComponent },
      {
        path: '',
        redirectTo: 'shifts',
        pathMatch: 'full' // don't forget it
      }
    ]
  },
  {
    path: '', redirectTo:'/home', pathMatch:'full',
  }
]
