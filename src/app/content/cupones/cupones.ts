import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth';

export interface Cupon {
  codigo: string;
  titulo: string;
  descripcion: string;
  porcentaje: number;
  minimoCompra: number;
  vigencia: string;
  etiqueta: string;
}

@Component({
  selector: 'app-cupones',
  standalone: false,
  templateUrl: './cupones.html',
  styleUrl: './cupones.css'
})
export class Cupones implements OnInit {
  public authService = inject(AuthService);

  cargando: boolean = true;
  codigoCopiado: string = '';

  listaCupones: Cupon[] = [
    {
      codigo: 'VIRTUOSA10',
      titulo: '10% de descuento en tu compra',
      descripcion: 'Válido en cualquier producto de labios, rostro, ojos o accesorios.',
      porcentaje: 10,
      minimoCompra: 300,
      vigencia: 'Válido hasta el 31 de diciembre de 2026',
      etiqueta: 'Bienvenida'
    },
    {
      codigo: 'GLAM20',
      titulo: '20% OFF en compras mayores a $700',
      descripcion: 'Ahorra en tus marcas favoritas como Rare Beauty, Maybelline y NYX.',
      porcentaje: 20,
      minimoCompra: 700,
      vigencia: 'Temporada 2026',
      etiqueta: 'Exclusivo Miembros'
    },
    {
      codigo: 'LABIOS15',
      titulo: '15% de descuento en toda la tienda',
      descripcion: 'Ideal para renovar tu colección de labiales mate, gloss y tintas.',
      porcentaje: 15,
      minimoCompra: 450,
      vigencia: 'Válido por tiempo limitado',
      etiqueta: 'Especial'
    }
  ];

  get todosLosCupones(): Cupon[] {
    return [...this.listaCupones, ...this.authService.cuponesAdmin()];
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.authService.estaAutenticado()) {
        window.location.assign('/login');
        return;
      }
      this.cargando = false;
    }, 450);
  }

  copiarCupon(cupon: Cupon): void {
    navigator.clipboard?.writeText(cupon.codigo);
    localStorage.setItem('virtuosa_cupon_activo', JSON.stringify(cupon));
    this.codigoCopiado = cupon.codigo;
    setTimeout(() => {
      this.codigoCopiado = '';
    }, 3000);
  }
}