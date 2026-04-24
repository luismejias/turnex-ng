import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminHomeComponent } from './pages/home/admin-home.component';
import { CompanyDetailComponent } from './pages/company-detail/company-detail.component';
import { CreateCompanyComponent } from './pages/create-company/create-company.component';
import { EditCompanyComponent } from './pages/edit-company/edit-company.component';
import { CreateProfileComponent } from './pages/create-profile/create-profile.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { CreateScheduleComponent } from './pages/create-schedule/create-schedule.component';
import { EditScheduleComponent } from './pages/edit-schedule/edit-schedule.component';
import { AdminProfileComponent } from './pages/profile/admin-profile.component';
import { superAdminGuard } from 'src/app/guards/super-admin.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [superAdminGuard],
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'companies', redirectTo: '', pathMatch: 'full' },
      { path: 'companies/create', component: CreateCompanyComponent },
      { path: 'companies/:id', component: CompanyDetailComponent },
      { path: 'companies/:id/edit', component: EditCompanyComponent },
      { path: 'companies/:companyId/profiles/create', component: CreateProfileComponent },
      { path: 'companies/:companyId/profiles/:profileId/edit', component: EditProfileComponent },
      { path: 'companies/:companyId/schedules/create', component: CreateScheduleComponent },
      { path: 'companies/:companyId/schedules/:shiftId/edit', component: EditScheduleComponent },
      { path: 'profile', component: AdminProfileComponent },
    ],
  },
];
