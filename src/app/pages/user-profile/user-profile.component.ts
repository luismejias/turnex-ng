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
		this.userProfileForm = this.fb.group({
      name: new UntypedFormControl('', Validators.required),
      lastName: new UntypedFormControl('', Validators.required),
			email: new UntypedFormControl('', Validators.required),
		});
	}

  logout(){
    this.appStateService.logout();
  }

}
