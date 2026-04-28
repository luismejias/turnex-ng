import { Component, inject } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';
import { EMAIL_PATTERN } from '../constants';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'turnex-login',
  imports: [TitleComponent, ButtonComponent, ReactiveFormsModule, NgClass, MatTooltipModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private appStateService = inject(AppStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: UntypedFormGroup;
  visiblePassword = false;
  emailPattern = EMAIL_PATTERN;
  isLoading = false;

  constructor(private fb: UntypedFormBuilder) {
    this.loginForm = this.fb.group({
      email: new UntypedFormControl('', Validators.required),
      password: new UntypedFormControl('', Validators.required),
      rememberData: new UntypedFormControl(''),
    });
  }

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get errorEmail() {
    return this.email.touched && this.email.dirty && !this.email.valid;
  }

  get errorPassword() {
    return this.password.touched && this.password.dirty && !this.password.valid;
  }

  login(): void {
    if (this.loginForm.invalid || this.isLoading) return;

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    this.authService.login(email.trim(), password).subscribe({
      next: (res) => {
        this.appStateService.login(res.user);
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Usuario o clave inválido!',
          text: 'Por favor revisa los datos ingresados e intenta de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#5F3CAA',
        });
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
