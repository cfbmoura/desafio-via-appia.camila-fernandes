import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  mode: 'login' | 'register' = 'login';
  loginValue = '';
  passwordValue = '';
  errorMessage = '';
  successMessage = '';

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  login() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginValue.trim() || !this.passwordValue.trim()) {
      this.errorMessage = 'Preencha login e senha.';
      return;
    }

    this.api.login({
      login: this.loginValue,
      password: this.passwordValue
    }).subscribe({
      next: (res: any) => {
        console.log(res);

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
        }

        this.router.navigate(['/books']);
      },
      error: (err) => {
        this.errorMessage = 'Nao foi possivel entrar. Verifique suas credenciais.';
        console.error(err);
      }
    });
  }

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginValue.trim() || !this.passwordValue.trim()) {
      this.errorMessage = 'Preencha login e senha para cadastrar.';
      return;
    }

    this.api.register({
      login: this.loginValue,
      password: this.passwordValue
    }).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso. Agora faca o login.';
        this.passwordValue = '';
        this.mode = 'login';
      },
      error: (err) => {
        this.errorMessage = 'Nao foi possivel cadastrar esse usuario.';
        console.error(err);
      }
    });
  }
}
