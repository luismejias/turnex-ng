import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminHomeComponent } from './pages/home/admin-home.component';
import { EmpresaDetailComponent } from './pages/empresa-detail/empresa-detail.component';
import { CrearEmpresaComponent } from './pages/crear-empresa/crear-empresa.component';
import { EditarEmpresaComponent } from './pages/editar-empresa/editar-empresa.component';
import { EditarPerfilComponent } from './pages/editar-perfil/editar-perfil.component';
import { EditarTurnoComponent } from './pages/editar-turno/editar-turno.component';
import { AdminPerfilComponent } from './pages/perfil/admin-perfil.component';
import { superAdminGuard } from 'src/app/guards/super-admin.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [superAdminGuard],
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'empresas', redirectTo: '', pathMatch: 'full' },
      { path: 'empresas/crear', component: CrearEmpresaComponent },
      { path: 'empresas/:id', component: EmpresaDetailComponent },
      { path: 'empresas/:id/editar', component: EditarEmpresaComponent },
      { path: 'empresas/:companyId/perfiles/:profileId/editar', component: EditarPerfilComponent },
      { path: 'empresas/:companyId/turnos/:shiftId/editar', component: EditarTurnoComponent },
      { path: 'perfil', component: AdminPerfilComponent },
    ],
  },
];
