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
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { CreateSpecialtyComponent } from './pages/create-specialty/create-specialty.component';
import { EditSpecialtyComponent } from './pages/edit-specialty/edit-specialty.component';
import { adminGuard } from 'src/app/guards/admin.guard';
import { superAdminGuard } from 'src/app/guards/super-admin.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'companies', redirectTo: '', pathMatch: 'full' },
      // SUPER_ADMIN only
      { path: 'companies/create', component: CreateCompanyComponent, canActivate: [superAdminGuard] },
      { path: 'companies/:id/edit', component: EditCompanyComponent, canActivate: [superAdminGuard] },
      // ADMIN + SUPER_ADMIN
      { path: 'companies/:id', component: CompanyDetailComponent },
      { path: 'companies/:companyId/profiles/create', component: CreateProfileComponent },
      { path: 'companies/:companyId/profiles/:profileId/edit', component: EditProfileComponent },
      { path: 'companies/:companyId/schedules/create', component: CreateScheduleComponent },
      { path: 'companies/:companyId/schedules/:shiftId/edit', component: EditScheduleComponent },
      { path: 'companies/:companyId/specialties/create', component: CreateSpecialtyComponent },
      { path: 'companies/:companyId/specialties/:specialtyId/edit', component: EditSpecialtyComponent },
      { path: 'companies/:companyId/users/create', component: CreateUserComponent },
      { path: 'companies/:companyId/users/:userId/edit', component: EditUserComponent },
      { path: 'profile', component: AdminProfileComponent },
    ],
  },
];
