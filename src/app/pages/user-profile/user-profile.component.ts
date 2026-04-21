import { Component, inject } from '@angular/core';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { EMAIL_PATTERN } from '../constants';
import { MatDialog } from '@angular/material/dialog';
import { AppStateService } from 'src/app/app.state.service';
import { UserProfileService } from './services/user-profile.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'turnex-user-profile',
  imports: [TitleComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  userProfileForm: UntypedFormGroup;
  visiblePassword = false;
  visiblePassword2 = false;
  emailPattern = EMAIL_PATTERN;

  private fb = inject(UntypedFormBuilder);
  private appStateService = inject(AppStateService);
  private userProfileService = inject(UserProfileService);
  private dialog = inject(MatDialog);

  constructor() {
    const userData = this.userProfileService.getDataUser();
    this.userProfileForm = this.fb.group({
      name: new UntypedFormControl(
        { value: userData?.name ?? '', disabled: true },
        Validators.required
      ),
      lastName: new UntypedFormControl(
        { value: userData?.lastName ?? '', disabled: true },
        Validators.required
      ),
      email: new UntypedFormControl(
        { value: userData?.email ?? '', disabled: true },
        Validators.required
      ),
    });
  }

  logout(): void {
    const ref = this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Cerrar sesión',
        message: '¿Estás seguro que querés cerrar la sesión?',
        confirmText: 'Sí, salir',
        cancelText: 'Cancelar',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.appStateService.logout();
    });
  }
}
