import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);

  email: string = '';
  password: string = '';
  mostrarPassword: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;

  async onLogin(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.mensajeError = 'Por favor, completa tu correo y contraseña.';
      return;
    }

    this.cargando = true;
    const resultado = await this.authService.iniciarSesion(this.email, this.password);

    if (resultado.ok) {
      this.mensajeExito = resultado.mensaje;
      setTimeout(() => {
        window.location.assign('/inicio');
      }, 1000);
    } else {
      this.cargando = false;
      this.mensajeError = resultado.mensaje;
    }
  }
}