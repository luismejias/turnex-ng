import { Component, inject } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EMAIL_PATTERN } from '../constants';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';
import { UserProfileService } from './services/user-profile.service';

@Component({
  selector: 'turnex-user-profile',
  standalone: true,
  imports: [CommonModule, TitleComponent, ButtonComponent, ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  userProfileForm: UntypedFormGroup;
  visiblePassword = false;
  visiblePassword2 = false;
  emailPattern = EMAIL_PATTERN;
  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private appStateService = inject(AppStateService);
  private userProfileService = inject(UserProfileService);


  constructor() {
    const { name, lastName, email } = this.userProfileService.getDataUser();
    this.userProfileForm = this.fb.group({
      name: new UntypedFormControl({ value: name, disabled: true }, Validators.required,),
      lastName: new UntypedFormControl({ value: lastName, disabled: true }, Validators.required),
      email: new UntypedFormControl({ value: email, disabled: true }, Validators.required),
    });
  }

  logout() {
    this.appStateService.logout();
  }

}
