import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ShiftsComponent } from "./pages/shifts/shifts.component";

export const routes: Routes =[
  {
    path: 'home', component: HomeComponent, title: 'Home page',
  },
  {
    path: 'shifts', component: ShiftsComponent, title: 'Shifts Page',
  }
]
