import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ShiftsComponent } from "./pages/shifts/shifts.component";
import { NewShiftComponent } from "./pages/shifts/components/new-shift/new-shift.component";

export const routes: Routes =[
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
