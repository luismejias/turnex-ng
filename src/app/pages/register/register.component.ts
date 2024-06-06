import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { EMAIL_PATTERN } from '../constants';

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
  constructor( private fb: UntypedFormBuilder, private router: Router ) {
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
      console.warn('Usuario Registrado');

    } else {
      console.error('faltan datos');

    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
