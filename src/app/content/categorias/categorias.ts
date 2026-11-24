import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

export interface Producto {
  sku: string;
  nombre: string;
  categoria: 'labios' | 'rostro' | 'ojos' | 'accesorios';
  categoriaNombre: string;
  precio: number;
  stock: number;
  tono: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);

  categoriaSeleccionada: string = 'todas';
  ordenSeleccionado: string = 'relevancia';
  soloDisponibles: boolean = false;
  busqueda: string = '';

  // Paginación para clientes: 12 productos por página
  paginaActual: number = 1;
  readonly productosPorPagina: number = 12;

  productoSeleccionado: Producto | null = null;
  avisoFlotante: string = '';

  productos: Producto[] = [
    {
      sku: 'VR-LAB-001',
      nombre: 'Maybelline SuperStay Matte Ink',
      categoria: 'labios',
      categoriaNombre: 'Labios',
      precio: 249,
      stock: 15,
      tono: 'Lover 15',
      descripcion: 'Labial líquido mate aterciopelado de alta pigmentación y larga duración hasta por 16 horas sin transferir.',
      imagen: 'imagenes/labial.png'
    },
    {
      sku: 'VR-LAB-002',
      nombre: 'Maybelline Lifter Gloss con Ácido Hialurónico',
      categoria: 'labios',
      categoriaNombre: 'Labios',
      precio: 235,
      stock: 22,
      tono: 'Moon 003',
      descripcion: 'Brillo labial hidratante enriquecido con ácido hialurónico que suaviza la superficie de los labios y aporta volumen visual.',
      imagen: 'imagenes/gloss.png'
    },
    {
      sku: 'VR-LAB-003',
      nombre: 'Benefit Benetint Tinta de Labios y Mejillas',
      categoria: 'labios',
      categoriaNombre: 'Labios',
      precio: 580,
      stock: 8,
      tono: 'Rose Original',
      descripcion: 'Tinta líquida icónica a prueba de besos con acabado natural translúcido para labios y mejillas.',
      imagen: 'imagenes/tinta.png'
    },
    {
      sku: 'VR-LAB-004',
      nombre: 'Bissú Tintaline Delineador de Labios',
      categoria: 'labios',
      categoriaNombre: 'Labios',
      precio: 65,
      stock: 0,
      tono: 'Natural 04',
      descripcion: 'Lápiz delineador cremoso de alta duración y precisión que define el contorno de los labios sin resecar.',
      imagen: 'imagenes/lapizojo.png'
    },
    {
      sku: 'VR-ROS-005',
      nombre: 'Maybelline Fit Me Matte + Poreless Base Líquida',
      categoria: 'rostro',
      categoriaNombre: 'Rostro',
      precio: 265,
      stock: 12,
      tono: 'Warm Nude 128',
      descripcion: 'Base líquida matificante ideal para piel normal a grasa. Difumina la apariencia de los poros y controla el brillo.',
      imagen: 'imagenes/base.png'
    },
    {
      sku: 'VR-ROS-006',
      nombre: 'Rare Beauty Soft Pinch Rubor Líquido',
      categoria: 'rostro',
      categoriaNombre: 'Rostro',
      precio: 640,
      stock: 18,
      tono: 'Hope (Malva Nude)',
      descripcion: 'Rubor líquido ligero de alta pigmentación que se difumina fácilmente logrando un acabado luminoso natural.',
      imagen: 'imagenes/rubor.png'
    },
    {
      sku: 'VR-ROS-007',
      nombre: 'Laura Mercier Polvo Fijador Translúcido',
      categoria: 'rostro',
      categoriaNombre: 'Rostro',
      precio: 990,
      stock: 10,
      tono: 'Translucent',
      descripcion: 'Polvo suelto ultrafino que sella el maquillaje hasta por 16 horas con acabado mate suave y cero efecto flashback.',
      imagen: 'imagenes/polvo.png'
    },
    {
      sku: 'VR-ROS-008',
      nombre: 'Bissú Iluminador Compacto',
      categoria: 'rostro',
      categoriaNombre: 'Rostro',
      precio: 89,
      stock: 6,
      tono: 'Sagitario 02',
      descripcion: 'Iluminador compacto de textura sedosa que aporta un destello sutil y elegante en los puntos altos del rostro.',
      imagen: 'imagenes/iluminador.png'
    },
    {
      sku: 'VR-OJO-009',
      nombre: 'Bissú Cuarteto de Sombras',
      categoria: 'ojos',
      categoriaNombre: 'Ojos y Cejas',
      precio: 75,
      stock: 9,
      tono: 'Tono 30 (Tonos Tierra)',
      descripcion: 'Cuarteto compacto de sombras altamente pigmentadas y fáciles de difuminar para looks naturales o ahumados.',
      imagen: 'imagenes/cuarteto.png'
    },
    {
      sku: 'VR-OJO-010',
      nombre: 'Maybelline Lash Sensational Sky High Máscara',
      categoria: 'ojos',
      categoriaNombre: 'Ojos y Cejas',
      precio: 279,
      stock: 20,
      tono: 'Very Black (A prueba de agua)',
      descripcion: 'Máscara de pestañas con cepillo flexible y extracto de bambú para brindar longitud y volumen sin grumos.',
      imagen: 'imagenes/rimel.png'
    },
    {
      sku: 'VR-OJO-011',
      nombre: 'NYX Epic Ink Liner Delineador Plumón',
      categoria: 'ojos',
      categoriaNombre: 'Ojos y Cejas',
      precio: 240,
      stock: 14,
      tono: 'Black',
      descripcion: 'Delineador líquido resistente al agua con punta de pincel ultrafina para trazos precisos e intensos.',
      imagen: 'imagenes/delineador.png'
    },
    {
      sku: 'VR-OJO-012',
      nombre: 'NYX The Brow Glue Gel Fijador de Cejas',
      categoria: 'ojos',
      categoriaNombre: 'Ojos y Cejas',
      precio: 215,
      stock: 11,
      tono: 'Transparente',
      descripcion: 'Gel fijador extremo para cejas con acabado transparente, no pegajoso y fijación de hasta 16 horas.',
      imagen: 'imagenes/cejas.png'
    },
    {
      sku: 'VR-ACC-013',
      nombre: 'Real Techniques Everyday Essentials Set de Brochas',
      categoria: 'accesorios',
      categoriaNombre: 'Brochas y Accesorios',
      precio: 549,
      stock: 7,
      tono: 'Edición Rosa / Coral',
      descripcion: 'Set completo de 4 brochas de cerdas sintéticas ultrasuaves y 1 esponja difuminadora para rostro y ojos.',
      imagen: 'imagenes/brochas.png'
    },
    {
      sku: 'VR-ACC-014',
      nombre: 'Beautyblender Original Esponja de Maquillaje',
      categoria: 'accesorios',
      categoriaNombre: 'Brochas y Accesorios',
      precio: 490,
      stock: 30,
      tono: 'Rosa Clásico',
      descripcion: 'Esponja libre de látex con diseño sin bordes para aplicar bases y correctores con acabado uniforme.',
      imagen: 'imagenes/esponja.png'
    },
    {
      sku: 'VR-ACC-015',
      nombre: 'Rare Beauty Puffy Cosmetiquera Acolchada',
      categoria: 'accesorios',
      categoriaNombre: 'Brochas y Accesorios',
      precio: 750,
      stock: 13,
      tono: 'Mauve',
      descripcion: 'Cosmetiquera acolchada de tacto suave con amplio espacio interior y cierre resistente para llevar tus esenciales.',
      imagen: 'imagenes/bolsa.png'
    },
    {
      sku: 'VR-ACC-016',
      nombre: 'Tweezerman Classic Rizador de Pestañas',
      categoria: 'accesorios',
      categoriaNombre: 'Brochas y Accesorios',
      precio: 460,
      stock: 16,
      tono: 'Rose Gold',
      descripcion: 'Rizador ergonómico de acero inoxidable con almohadillas de silicón hipoalergénicas que curvan sin pellizcar.',
      imagen: 'imagenes/enchinador.png'
    }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        this.categoriaSeleccionada = params['cat'];
        this.busqueda = '';
      }
      if (params['q']) {
        this.busqueda = params['q'];
        this.categoriaSeleccionada = 'todas';
      } else if (!params['cat']) {
        this.busqueda = '';
      }
      this.paginaActual = 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  get todosLosProductos(): Producto[] {
    let ocultos: string[] = [];
    try {
      ocultos = JSON.parse(localStorage.getItem('virtuosa_skus_ocultos') || '[]');
    } catch {}

    const mapaAdmin = new Map<string, Producto>();
    for (const item of this.authService.productosAdmin()) {
      mapaAdmin.set(item.sku, item as Producto);
    }

    const baseVisibles = this.productos
      .filter(p => !ocultos.includes(p.sku))
      .map(p => (mapaAdmin.has(p.sku) ? mapaAdmin.get(p.sku)! : p));

    const skusBase = new Set(this.productos.map(p => p.sku));
    const nuevosAdmin = this.authService.productosAdmin()
      .filter(p => !skusBase.has(p.sku)) as Producto[];

    return [...baseVisibles, ...nuevosAdmin];
  }

  get productosFiltrados(): Producto[] {
    let resultado = this.todosLosProductos.filter(p => {
      const coincideCategoria = this.categoriaSeleccionada === 'todas' || p.categoria === this.categoriaSeleccionada;
      const coincideStock = !this.soloDisponibles || p.stock > 0;
      const termino = this.busqueda.trim().toLowerCase();
      const coincideTexto = !termino || 
        p.nombre.toLowerCase().includes(termino) ||
        p.sku.toLowerCase().includes(termino) ||
        p.tono.toLowerCase().includes(termino) ||
        p.categoriaNombre.toLowerCase().includes(termino);
      return coincideCategoria && coincideStock && coincideTexto;
    });

    if (this.ordenSeleccionado === 'menor-precio') {
      resultado = [...resultado].sort((a, b) => a.precio - b.precio);
    } else if (this.ordenSeleccionado === 'mayor-precio') {
      resultado = [...resultado].sort((a, b) => b.precio - a.precio);
    } else if (this.ordenSeleccionado === 'nombre') {
      resultado = [...resultado].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return resultado;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.productosFiltrados.length / this.productosPorPagina));
  }

  get paginasDisponibles(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get productosPaginados(): Producto[] {
    const paginaSegura = Math.min(this.paginaActual, this.totalPaginas);
    const inicio = (paginaSegura - 1) * this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.productosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reiniciarPaginacion(): void {
    this.paginaActual = 1;
  }

  async onToggleFavorito(prod: Producto, event?: Event): Promise<void> {
    const ok = await this.authService.toggleFavorito(prod, event);
    if (!ok) {
      this.mostrarAviso('Inicia sesión para guardar productos en tus favoritos.');
    }
  }

  async onAgregarCarrito(prod: Producto, event?: Event): Promise<void> {
    const res = await this.authService.agregarAlCarrito(prod, event);
    this.mostrarAviso(res.mensaje);
  }

  abrirDetalle(prod: Producto): void {
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

  limpiarFiltros(): void {
    this.categoriaSeleccionada = 'todas';
    this.ordenSeleccionado = 'relevancia';
    this.soloDisponibles = false;
    this.busqueda = '';
    this.paginaActual = 1;
  }

  imagenPorDefecto(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/600x600/fce4ec/df5c8e?text=Virtuosa%27s+Room';
  }
}