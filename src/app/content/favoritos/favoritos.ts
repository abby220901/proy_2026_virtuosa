import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-favoritos',
  standalone: false,
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class Favoritos {
  // =========================================================================
  // SERVICIOS Y NOTIFICACIONES
  // =========================================================================

  public authService = inject(AuthService);
  mensajeNotificacion: string = '';

  async quitarFavorito(producto: any, event?: Event): Promise<void> {
    await this.authService.toggleFavorito(producto, event);
  }

  async moverAlCarrito(producto: any, event?: Event): Promise<void> {
    const res = await this.authService.agregarAlCarrito(producto, event);
    this.mensajeNotificacion = res.mensaje;
    setTimeout(() => {
      this.mensajeNotificacion = '';
    }, 3000);
  }
}