import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import { EMAIL_PATTERN } from '../constants';
import { UserProfileService } from '../user-profile';
import { User } from 'src/app/models';
import Swal from 'sweetalert2';

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
      password: new UntypedFormControl('', Validators.required),
      password2: new UntypedFormControl('', Validators.required),
      rememberData: new UntypedFormControl(''),
    });

  }
  register(): void {
    const { name, lastName, email, password, password2 } = this.registerForm.value;
    const emailAux = email.trim();
    if (name && lastName && emailAux && password && password2) {
      const userExist = this.getUser(email);
      if (!userExist) {
        this.saveUser({ id: this._generateRandomId(), name, lastName, email: emailAux, password, active: true, termAndConditions: true });
        Swal.fire({
          title: '¡Usuario registrado exitosamente!',
          icon: 'success',
        });
        this.router.navigate(['login']);
      } else {
        Swal.fire({
          title: '¡Usuario existente!',
          text: 'Por favor revisa los datos ingresados e intenta de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#5F3CAA'
        });
      }

    } else {
      console.error('faltan datos');
    }
  }

  getUser(email: string) {
    return this.userProfileService.getUser(email)
  }

  saveUser(user: User): void {
    this.userProfileService.saveUser(user);
  }

  private _generateRandomId() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
