import { CommonModule, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { EMAIL_PATTERN } from '../constants';
import { AuthService } from 'src/app/shared/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'turnex-register',
  imports: [
    TitleComponent,
    ButtonComponent,
    ReactiveFormsModule,
    NgClass,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: UntypedFormGroup;
  visiblePassword = false;
  visiblePassword2 = false;
  emailPattern = EMAIL_PATTERN;
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: new UntypedFormControl('', Validators.required),
      lastName: new UntypedFormControl('', Validators.required),
      email: new UntypedFormControl('', Validators.required),
      password: new UntypedFormControl('', Validators.required),
      password2: new UntypedFormControl('', Validators.required),
      rememberData: new UntypedFormControl(''),
    });
  }

  register(): void {
    if (this.registerForm.invalid || this.isLoading) return;

    const { name, lastName, email, password } = this.registerForm.value;
    this.isLoading = true;

    this.authService.register({
      name,
      lastName,
      email: email.trim(),
      password,
      termAndConditions: true,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Usuario registrado exitosamente!',
          icon: 'success',
        }).then(() => this.router.navigate(['/login']));
      },
      error: (err: string) => {
        this.isLoading = false;
        const isConflict = err.includes('409');
        Swal.fire({
          title: isConflict ? '¡Email ya registrado!' : '¡Error al registrar!',
          text: isConflict
            ? 'Ya existe una cuenta con ese email.'
            : 'Por favor intenta de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#5F3CAA',
        });
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
