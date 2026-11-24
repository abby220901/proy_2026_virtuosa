import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  private authService = inject(AuthService);

  nombre: string = '';
  apellido: string = '';
  email: string = '';
  telefono: string = '';
  password: string = '';
  confirmarPassword: string = '';
  mostrarPassword: boolean = false;
  mensajeError: string = '';
  cargando: boolean = false;

  async onRegistro(): Promise<void> {
    this.mensajeError = '';

    if (!this.nombre.trim() || !this.apellido.trim() || !this.email.trim() || !this.password.trim()) {
      this.mensajeError = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

    if (this.password.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    const resultado = await this.authService.registrarUsuario(
      {
        nombre: this.nombre.trim(),
        apellido: this.apellido.trim(),
        email: this.email.trim(),
        telefono: this.telefono.trim()
      },
      this.password
    );
    this.cargando = false;

    if (resultado.ok) {
      window.location.href = '/inicio';
    } else {
      this.mensajeError = resultado.mensaje;
    }
  }
}