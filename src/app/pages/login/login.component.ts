import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ButtonComponent, TitleComponent } from 'src/app/components';
import Swal from 'sweetalert2';
import { NgClass, NgIf } from '@angular/common';
import { EMAIL_PATTERN } from '../constants';
import { Router } from '@angular/router';
import { AppStateService } from 'src/app/app.state.service';
import { UserProfileService } from '../user-profile';
@Component({
  selector: 'turnex-login',
  standalone: true,
  imports: [TitleComponent, ButtonComponent, ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private appStateService = inject(AppStateService);
  private userProfileService = inject(UserProfileService);
  loginForm: UntypedFormGroup;
  visiblePassword = false;
  emailPattern = EMAIL_PATTERN;

  constructor(private fb: UntypedFormBuilder, private router: Router) {
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
    const { email, password } = this.loginForm.value;
    const emailAux = email.trim();
    this.userProfileService.getUser(emailAux,password).subscribe(user => {
      if (user) {
        this.appStateService.login(user);
      } else {
        Swal.fire({
          title: '¡Usuario o clave inválido!',
          text: 'Por favor revisa los datos ingresados e intenta de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#5F3CAA'
        })
        this.appStateService.logout();
      }
    });
  }
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
