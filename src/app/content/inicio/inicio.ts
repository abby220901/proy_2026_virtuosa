import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';

export interface ProductoDestacado {
  sku: string;
  nombre: string;
  categoriaNombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
}

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  public authService = inject(AuthService);

  productoSeleccionado: ProductoDestacado | null = null;
  avisoFlotante: string = '';

  favoritosMes: ProductoDestacado[] = [
    {
      sku: 'VR-LAB-001',
      nombre: 'Maybelline SuperStay Matte Ink',
      categoriaNombre: 'LABIOS',
      descripcion: 'Tono Lover 15 • Acabado mate aterciopelado de larga duración hasta por 16 horas.',
      precio: 249,
      stock: 15,
      imagen: 'imagenes/labial.png'
    },
    {
      sku: 'VR-OJO-010',
      nombre: 'Maybelline Lash Sensational Sky High',
      categoriaNombre: 'OJOS',
      descripcion: 'Tono Very Black • Máscara a prueba de agua con extracto de bambú para longitud extrema.',
      precio: 279,
      stock: 20,
      imagen: 'imagenes/rimel.png'
    },
    {
      sku: 'VR-ROS-006',
      nombre: 'Rare Beauty Soft Pinch Rubor Líquido',
      categoriaNombre: 'ROSTRO',
      descripcion: 'Tono Hope (Malva Nude) • Fórmula ligera de alta pigmentación con acabado luminoso natural.',
      precio: 640,
      stock: 4,
      imagen: 'imagenes/rubor.png'
    }
  ];

  async onToggleFavorito(prod: ProductoDestacado, event?: Event): Promise<void> {
    const ok = await this.authService.toggleFavorito(prod, event);
    if (!ok) {
      this.mostrarAviso('Inicia sesión para guardar productos en tus favoritos.');
    }
  }

  async onAgregarCarrito(prod: ProductoDestacado, event?: Event): Promise<void> {
    const res = await this.authService.agregarAlCarrito(prod, event);
    this.mostrarAviso(res.mensaje);
  }

  abrirDetalle(prod: ProductoDestacado): void {
    this.productoSeleccionado = prod;
  }

  cerrarDetalle(): void {
    this.productoSeleccionado = null;
  }

  private mostrarAviso(msg: string): void {
    this.avisoFlotante = msg;
    setTimeout(() => {
      this.avisoFlotante = '';
    }, 3500);
  }

  imagenPorDefecto(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/600x600/fce4ec/df5c8e?text=Virtuosa%27s+Room';
  }
}