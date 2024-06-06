import { Component } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import {  ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { EMAIL_PATTERN } from '../constants';
import { Router } from '@angular/router';
@Component({
  selector: 'turnex-login',
  standalone: true,
  imports: [TitleComponent, ButtonComponent, ReactiveFormsModule, NgClass, NgIf ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: UntypedFormGroup;
  visiblePassword = false;
  emailPattern = EMAIL_PATTERN;

  constructor( private fb: UntypedFormBuilder, private router: Router ) {
		this.loginForm = this.fb.group({
			email: new UntypedFormControl('', Validators.required),
			password: new UntypedFormControl('',Validators.required),
      rememberData: new UntypedFormControl(''),
		});
	}

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get errorEmail(){
    return this.email.touched && this.email.dirty && !this.email.valid;
  }

  get errorPassword(){
    return this.password.touched && this.password.dirty && !this.password.valid;
  }

  login(): void{
    const { email, password } = this.loginForm.value;
    const emailAux = email.trim();
    if(emailAux ==='luis@gmail.com' && password === '123456' ){
      console.warn('Usuario valido');

    } else {
      console.error('Usuario invalido');

    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

}
