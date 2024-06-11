import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { EMAIL_PATTERN } from '../constants';
import { UserProfileService } from '../user-profile';
import { User } from 'src/app/models';

@Component({
  selector: 'turnex-register',
  standalone: true,
  imports: [TitleComponent, ButtonComponent, ReactiveFormsModule, NgClass, NgIf, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: UntypedFormGroup;
  visiblePassword = false;
  visiblePassword2 = false;
  emailPattern = EMAIL_PATTERN;
  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);
  constructor() {
		this.registerForm = this.fb.group({
      name: new UntypedFormControl('', Validators.required),
      lastName: new UntypedFormControl('', Validators.required),
			email: new UntypedFormControl('', Validators.required),
			password: new UntypedFormControl('',Validators.required),
			password2: new UntypedFormControl('',Validators.required),
      rememberData: new UntypedFormControl(''),
		});

	}

  register(): void{
    const { name, lastName, email, password, password2  } = this.registerForm.value;
    const emailAux = email.trim();
    if(name && lastName && emailAux && password && password2 ){
      this.saveUser({id: this._generateRandomId(), name, lastName , email: emailAux , password, active: true, termAndConditions: true})
      console.warn('Usuario Registrado');

    } else {
      console.error('faltan datos');

    }
  }

  saveUser(user: User): void {
    this.userProfileService.saveUser(user);
  }

  private _generateRandomId() {
    return Number(Date.now().toString(36) + Math.random().toString(36).substring(2, 9));
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
