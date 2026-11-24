import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  // =========================================================================
  // SERVICIOS Y NAVEGACIÓN
  // =========================================================================

  public authService = inject(AuthService);
  private router = inject(Router);

  cerrandoSesion: boolean = false;
  nombreDespedida: string = '';

  cerrarSesion(): void {
    if (this.cerrandoSesion) return;

    this.nombreDespedida = this.authService.obtenerNombreVisible();
    this.cerrandoSesion = true;

    setTimeout(async () => {
      await this.authService.cerrarSesion();
      this.cerrandoSesion = false;
      this.nombreDespedida = '';
      this.router.navigate(['/inicio']);
    }, 1500);
  }
}