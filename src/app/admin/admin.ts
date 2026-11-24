import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  public authService = inject(AuthService);

  pestanaActiva: 'productos' | 'pedidos' | 'cupones' = 'productos';
  cargando: boolean = true;
  guardandoMasivo: boolean = false;
  guardandoNuevo: boolean = false;
  mensajeExito: string = '';

  filtroEstadoPedido: string = 'todos';
  pedidoSeleccionado: any | null = null;

  // Paginación para administrador: 20 productos por página
  paginaAdminActual: number = 1;
  readonly productosPorPaginaAdmin: number = 20;

  // Interruptores independientes de la pestaña Productos
  mostrarFormAgregar: boolean = false;
  modoEdicionTabla: boolean = false;
  productosEditables: any[] = [];

  productosBase = [
    { sku: 'VR-LAB-001', nombre: 'Maybelline SuperStay Matte Ink', categoria: 'labios', categoriaNombre: 'Labios', precio: 249, stock: 15, tono: 'Lover 15', descripcion: 'Labial líquido mate aterciopelado de alta pigmentación y larga duración hasta por 16 horas sin transferir.', imagen: 'imagenes/labial.png', origen: 'Catálogo Base' },
    { sku: 'VR-LAB-002', nombre: 'Maybelline Lifter Gloss con Ácido Hialurónico', categoria: 'labios', categoriaNombre: 'Labios', precio: 235, stock: 22, tono: 'Moon 003', descripcion: 'Brillo labial hidratante enriquecido con ácido hialurónico que suaviza la superficie de los labios y aporta volumen visual.', imagen: 'imagenes/gloss.png', origen: 'Catálogo Base' },
    { sku: 'VR-LAB-003', nombre: 'Benefit Benetint Tinta de Labios y Mejillas', categoria: 'labios', categoriaNombre: 'Labios', precio: 580, stock: 8, tono: 'Rose Original', descripcion: 'Tinta líquida icónica a prueba de besos con acabado natural translúcido para labios y mejillas.', imagen: 'imagenes/tinta.png', origen: 'Catálogo Base' },
    { sku: 'VR-LAB-004', nombre: 'Bissú Tintaline Delineador de Labios', categoria: 'labios', categoriaNombre: 'Labios', precio: 65, stock: 0, tono: 'Natural 04', descripcion: 'Lápiz delineador cremoso de alta duración y precisión que define el contorno de los labios sin resecar.', imagen: 'imagenes/lapizojo.png', origen: 'Catálogo Base' },
    { sku: 'VR-ROS-005', nombre: 'Maybelline Fit Me Matte + Poreless Base Líquida', categoria: 'rostro', categoriaNombre: 'Rostro', precio: 265, stock: 12, tono: 'Warm Nude 128', descripcion: 'Base líquida matificante ideal para piel normal a grasa. Difumina la apariencia de los poros y controla el brillo.', imagen: 'imagenes/base.png', origen: 'Catálogo Base' },
    { sku: 'VR-ROS-006', nombre: 'Rare Beauty Soft Pinch Rubor Líquido', categoria: 'rostro', categoriaNombre: 'Rostro', precio: 640, stock: 18, tono: 'Hope (Malva Nude)', descripcion: 'Rubor líquido ligero de alta pigmentación que se difumina fácilmente logrando un acabado luminoso natural.', imagen: 'imagenes/rubor.png', origen: 'Catálogo Base' },
    { sku: 'VR-ROS-007', nombre: 'Laura Mercier Polvo Fijador Translúcido', categoria: 'rostro', categoriaNombre: 'Rostro', precio: 990, stock: 10, tono: 'Translucent', descripcion: 'Polvo suelto ultrafino que sella el maquillaje hasta por 16 horas con acabado mate suave y cero efecto flashback.', imagen: 'imagenes/polvo.png', origen: 'Catálogo Base' },
    { sku: 'VR-ROS-008', nombre: 'Bissú Iluminador Compacto', categoria: 'rostro', categoriaNombre: 'Rostro', precio: 89, stock: 6, tono: 'Sagitario 02', descripcion: 'Iluminador compacto de textura sedosa que aporta un destello sutil y elegante en los puntos altos del rostro.', imagen: 'imagenes/iluminador.png', origen: 'Catálogo Base' },
    { sku: 'VR-OJO-009', nombre: 'Bissú Cuarteto de Sombras', categoria: 'ojos', categoriaNombre: 'Ojos y Cejas', precio: 75, stock: 9, tono: 'Tono 30 (Tonos Tierra)', descripcion: 'Cuarteto compacto de sombras altamente pigmentadas y fáciles de difuminar para looks naturales o ahumados.', imagen: 'imagenes/cuarteto.png', origen: 'Catálogo Base' },
    { sku: 'VR-OJO-010', nombre: 'Maybelline Lash Sensational Sky High Máscara', categoria: 'ojos', categoriaNombre: 'Ojos y Cejas', precio: 279, stock: 20, tono: 'Very Black (A prueba de agua)', descripcion: 'Máscara de pestañas con cepillo flexible y extracto de bambú para brindar longitud y volumen sin grumos.', imagen: 'imagenes/rimel.png', origen: 'Catálogo Base' },
    { sku: 'VR-OJO-011', nombre: 'NYX Epic Ink Liner Delineador Plumón', categoria: 'ojos', categoriaNombre: 'Ojos y Cejas', precio: 240, stock: 14, tono: 'Black', descripcion: 'Delineador líquido resistente al agua con punta de pincel ultrafina para trazos precisos e intensos.', imagen: 'imagenes/delineador.png', origen: 'Catálogo Base' },
    { sku: 'VR-OJO-012', nombre: 'NYX The Brow Glue Gel Fijador de Cejas', categoria: 'ojos', categoriaNombre: 'Ojos y Cejas', precio: 215, stock: 11, tono: 'Transparente', descripcion: 'Gel fijador extremo para cejas con acabado transparente, no pegajoso y fijación de hasta 16 horas.', imagen: 'imagenes/cejas.png', origen: 'Catálogo Base' },
    { sku: 'VR-ACC-013', nombre: 'Real Techniques Everyday Essentials Set de Brochas', categoria: 'accesorios', categoriaNombre: 'Brochas y Accesorios', precio: 549, stock: 7, tono: 'Edición Rosa / Coral', descripcion: 'Set completo de 4 brochas de cerdas sintéticas ultrasuaves y 1 esponja difuminadora para rostro y ojos.', imagen: 'imagenes/brochas.png', origen: 'Catálogo Base' },
    { sku: 'VR-ACC-014', nombre: 'Beautyblender Original Esponja de Maquillaje', categoria: 'accesorios', categoriaNombre: 'Brochas y Accesorios', precio: 490, stock: 30, tono: 'Rosa Clásico', descripcion: 'Esponja libre de látex con diseño sin bordes para aplicar bases y correctores con acabado uniforme.', imagen: 'imagenes/esponja.png', origen: 'Catálogo Base' },
    { sku: 'VR-ACC-015', nombre: 'Rare Beauty Puffy Cosmetiquera Acolchada', categoria: 'accesorios', categoriaNombre: 'Brochas y Accesorios', precio: 750, stock: 13, tono: 'Mauve', descripcion: 'Cosmetiquera acolchada de tacto suave con amplio espacio interior y cierre resistente para llevar tus esenciales.', imagen: 'imagenes/bolsa.png', origen: 'Catálogo Base' },
    { sku: 'VR-ACC-016', nombre: 'Tweezerman Classic Rizador de Pestañas', categoria: 'accesorios', categoriaNombre: 'Brochas y Accesorios', precio: 460, stock: 16, tono: 'Rose Gold', descripcion: 'Rizador ergonómico de acero inoxidable con almohadillas de silicón hipoalergénicas que curvan sin pellizcar.', imagen: 'imagenes/enchinador.png', origen: 'Catálogo Base' }
  ];

  skusOcultos: string[] = [];

  nuevoProducto = {
    sku: '',
    nombre: '',
    categoria: 'labios' as 'labios' | 'rostro' | 'ojos' | 'accesorios',
    categoriaNombre: 'Labios',
    precio: 0,
    stock: 10,
    tono: '',
    descripcion: '',
    imagen: 'imagenes/labial.png'
  };

  variantesNuevoProducto: Array<{ sku: string; tono: string; precio: number; stock: number; imagen: string }> = [];

  nuevoCupon = {
    codigo: '',
    titulo: '',
    descripcion: '',
    porcentaje: 15,
    minimoCompra: 350,
    vigencia: 'Temporada 2026',
    etiqueta: 'Admin Promo'
  };

  ngOnInit(): void {
    try {
      this.skusOcultos = JSON.parse(localStorage.getItem('virtuosa_skus_ocultos') || '[]');
    } catch {
      this.skusOcultos = [];
    }

    setTimeout(async () => {
      if (!this.authService.esAdmin()) {
        window.location.assign('/inicio');
        return;
      }
      await this.authService.cargarCatalogoAdmin();
      await this.authService.cargarCuponesAdmin();
      await this.authService.cargarTodosLosPedidos();
      this.cargando = false;
    }, 500);
  }

  get inventarioCompleto(): any[] {
    const mapaAdmin = new Map<string, any>();
    for (const item of this.authService.productosAdmin()) {
      mapaAdmin.set(item.sku, { ...item, origen: 'Editado / Admin' });
    }

    const baseCombinados = this.productosBase
      .filter(p => !this.skusOcultos.includes(p.sku))
      .map(p => (mapaAdmin.has(p.sku) ? mapaAdmin.get(p.sku) : p));

    const skusBase = new Set(this.productosBase.map(p => p.sku));
    const soloNuevos = this.authService.productosAdmin()
      .filter(p => !skusBase.has(p.sku))
      .map(p => ({ ...p, origen: 'Agregado Admin' }));

    return [...soloNuevos, ...baseCombinados];
  }

  // Propiedades de paginación de 20 en 20 para el Administrador
  get totalProductosAdminLista(): number {
    return this.modoEdicionTabla ? this.productosEditables.length : this.inventarioCompleto.length;
  }

  get totalPaginasAdmin(): number {
    return Math.max(1, Math.ceil(this.totalProductosAdminLista / this.productosPorPaginaAdmin));
  }

  get paginasAdminDisponibles(): number[] {
    return Array.from({ length: this.totalPaginasAdmin }, (_, i) => i + 1);
  }

  get indiceInicioAdmin(): number {
    const paginaSegura = Math.min(this.paginaAdminActual, this.totalPaginasAdmin);
    return (paginaSegura - 1) * this.productosPorPaginaAdmin;
  }

  get inventarioPaginado(): any[] {
    return this.inventarioCompleto.slice(this.indiceInicioAdmin, this.indiceInicioAdmin + this.productosPorPaginaAdmin);
  }

  get productosEditablesPaginados(): any[] {
    return this.productosEditables.slice(this.indiceInicioAdmin, this.indiceInicioAdmin + this.productosPorPaginaAdmin);
  }

  cambiarPaginaAdmin(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginasAdmin) return;
    this.paginaAdminActual = pagina;
  }

  get pedidosFiltrados(): any[] {
    if (this.filtroEstadoPedido === 'todos') {
      return this.authService.pedidosGlobales();
    }
    return this.authService.pedidosGlobales().filter(p => p.estado === this.filtroEstadoPedido);
  }

  get totalVentasRecaudadas(): number {
    return this.authService.pedidosGlobales().reduce((acc, p) => acc + (p.total || 0), 0);
  }

  private obtenerNombreCategoria(cat: string): string {
    const mapa: Record<string, string> = {
      labios: 'Labios',
      rostro: 'Rostro',
      ojos: 'Ojos y Cejas',
      accesorios: 'Brochas y Accesorios'
    };
    return mapa[cat] || 'Labios';
  }

  actualizarNombreCategoria(): void {
    this.nuevoProducto.categoriaNombre = this.obtenerNombreCategoria(this.nuevoProducto.categoria);
  }

  // =========================================================================
  // FORMULARIO AGREGAR NUEVO PRODUCTO + SUS VARIANTES
  // =========================================================================

  abrirFormAgregar(): void {
    this.mostrarFormAgregar = true;
  }

  cerrarFormAgregar(): void {
    this.mostrarFormAgregar = false;
    this.variantesNuevoProducto = [];
    this.nuevoProducto = {
      sku: '',
      nombre: '',
      categoria: 'labios',
      categoriaNombre: 'Labios',
      precio: 0,
      stock: 10,
      tono: '',
      descripcion: '',
      imagen: 'imagenes/labial.png'
    };
  }

  agregarVarianteEnFormulario(): void {
    const baseSku = (this.nuevoProducto.sku.trim() || 'VR-PROD-001').toUpperCase();
    const numVariante = this.variantesNuevoProducto.length + 2;

    this.variantesNuevoProducto.push({
      sku: `${baseSku}-V${numVariante}`,
      tono: '',
      precio: Number(this.nuevoProducto.precio) || 0,
      stock: Number(this.nuevoProducto.stock) || 10,
      imagen: this.nuevoProducto.imagen || 'imagenes/labial.png'
    });
  }

  quitarVarianteDeFormulario(indice: number): void {
    this.variantesNuevoProducto.splice(indice, 1);
  }

  async agregarProducto(): Promise<void> {
    if (!this.nuevoProducto.sku.trim() || !this.nuevoProducto.nombre.trim() || this.nuevoProducto.precio <= 0) {
      alert('Completa al menos el SKU, nombre y precio válido del producto principal.');
      return;
    }

    this.guardandoNuevo = true;
    this.actualizarNombreCategoria();
    const skuPrincipal = this.nuevoProducto.sku.trim().toUpperCase();

    await this.authService.guardarProductoAdmin({
      ...this.nuevoProducto,
      sku: skuPrincipal,
      precio: Number(this.nuevoProducto.precio),
      stock: Number(this.nuevoProducto.stock)
    });

    let totalPublicados = 1;
    for (const v of this.variantesNuevoProducto) {
      const skuVar = v.sku.trim().toUpperCase();
      if (!skuVar) continue;

      await this.authService.guardarProductoAdmin({
        sku: skuVar,
        nombre: this.nuevoProducto.nombre.trim(),
        categoria: this.nuevoProducto.categoria,
        categoriaNombre: this.nuevoProducto.categoriaNombre,
        precio: Number(v.precio) > 0 ? Number(v.precio) : Number(this.nuevoProducto.precio),
        stock: Number(v.stock),
        tono: v.tono.trim() || 'Variante',
        descripcion: this.nuevoProducto.descripcion,
        imagen: v.imagen.trim() || this.nuevoProducto.imagen
      });
      totalPublicados++;
    }

    this.guardandoNuevo = false;
    this.cerrarFormAgregar();
    this.paginaAdminActual = 1;

    this.notificar(
      totalPublicados > 1
        ? `Se publicaron ${totalPublicados} productos (principal + variantes) en el catálogo.`
        : `Producto ${skuPrincipal} publicado en el catálogo.`
    );
  }

  // =========================================================================
  // MODO EDICIÓN MASIVA Y VARIANTES DE PRODUCTO
  // =========================================================================

  activarModoEdicion(): void {
    this.productosEditables = this.inventarioCompleto.map(p => ({
      ...p,
      esNuevaVariante: false
    }));
    this.modoEdicionTabla = true;
  }

  cancelarModoEdicion(): void {
    this.modoEdicionTabla = false;
    this.productosEditables = [];
    if (this.paginaAdminActual > this.totalPaginasAdmin) {
      this.paginaAdminActual = this.totalPaginasAdmin;
    }
  }

  anadirVariante(indiceEnPagina: number): void {
    const indiceReal = this.indiceInicioAdmin + indiceEnPagina;
    const base = this.productosEditables[indiceReal];
    const raizSku = base.sku.replace(/-V\d+$/i, '');

    let contador = 2;
    let nuevoSku = `${raizSku}-V${contador}`;
    while (this.productosEditables.some(p => p.sku.toUpperCase() === nuevoSku.toUpperCase())) {
      contador++;
      nuevoSku = `${raizSku}-V${contador}`;
    }

    const variante = {
      ...base,
      sku: nuevoSku,
      tono: `${base.tono ? base.tono + ' - ' : ''}Variante ${contador}`,
      stock: 10,
      origen: 'Nueva Variante',
      esNuevaVariante: true
    };

    this.productosEditables.splice(indiceReal + 1, 0, variante);
    this.notificar(`Variante ${nuevoSku} añadida debajo de "${base.nombre}". Edita su tono y guarda.`);
  }

  async guardarEdicionMasiva(): Promise<void> {
    this.guardandoMasivo = true;
    const originalesPorSku = new Map(this.inventarioCompleto.map(p => [p.sku, p]));

    for (const editado of this.productosEditables) {
      const skuLimpio = editado.sku.trim().toUpperCase();
      if (!skuLimpio || !editado.nombre.trim()) continue;

      editado.sku = skuLimpio;
      editado.categoriaNombre = this.obtenerNombreCategoria(editado.categoria);

      const original = originalesPorSku.get(skuLimpio);
      const huboCambio =
        !original ||
        editado.esNuevaVariante ||
        original.nombre !== editado.nombre ||
        original.categoria !== editado.categoria ||
        Number(original.precio) !== Number(editado.precio) ||
        Number(original.stock) !== Number(editado.stock) ||
        (original.tono || '') !== (editado.tono || '') ||
        (original.imagen || '') !== (editado.imagen || '');

      if (huboCambio) {
        const { origen, esNuevaVariante, ...datosLimpios } = editado;
        await this.authService.guardarProductoAdmin({
          ...datosLimpios,
          precio: Number(editado.precio),
          stock: Number(editado.stock)
        });
      }
    }

    this.guardandoMasivo = false;
    this.modoEdicionTabla = false;
    this.productosEditables = [];
    this.notificar('Todos los cambios y variantes fueron guardados en Firestore.');
  }

  // =========================================================================
  // BORRAR PRODUCTOS, CUPONES Y PEDIDOS
  // =========================================================================

  async borrarProducto(prod: any): Promise<void> {
    if (prod.esNuevaVariante) {
      this.productosEditables = this.productosEditables.filter(p => p.sku !== prod.sku);
      if (this.paginaAdminActual > this.totalPaginasAdmin) {
        this.paginaAdminActual = this.totalPaginasAdmin;
      }
      return;
    }

    const esBase = this.productosBase.some(b => b.sku === prod.sku);
    await this.authService.eliminarProductoAdmin(prod.sku);

    if (esBase) {
      this.skusOcultos = Array.from(new Set([...this.skusOcultos, prod.sku]));
      localStorage.setItem('virtuosa_skus_ocultos', JSON.stringify(this.skusOcultos));
    }

    if (this.modoEdicionTabla) {
      this.productosEditables = this.productosEditables.filter(p => p.sku !== prod.sku);
    }

    if (this.paginaAdminActual > this.totalPaginasAdmin) {
      this.paginaAdminActual = this.totalPaginasAdmin;
    }

    this.notificar(`Producto ${prod.sku} eliminado del catálogo.`);
  }

  restaurarCatalogoBase(): void {
    this.skusOcultos = [];
    localStorage.removeItem('virtuosa_skus_ocultos');
    if (this.modoEdicionTabla) {
      this.activarModoEdicion();
    }
    this.notificar('Se restauraron todos los productos base del catálogo.');
  }

  async agregarCupon(): Promise<void> {
    if (!this.nuevoCupon.codigo.trim() || !this.nuevoCupon.titulo.trim() || this.nuevoCupon.porcentaje <= 0) {
      alert('Completa el código, título y porcentaje de descuento.');
      return;
    }

    await this.authService.guardarCuponAdmin(this.nuevoCupon);
    this.nuevoCupon = {
      codigo: '',
      titulo: '',
      descripcion: '',
      porcentaje: 15,
      minimoCompra: 350,
      vigencia: 'Temporada 2026',
      etiqueta: 'Admin Promo'
    };
    this.notificar('Cupón publicado y disponible para los clientes.');
  }

  async eliminarCupon(codigo: string): Promise<void> {
    await this.authService.eliminarCuponAdmin(codigo);
    this.notificar(`Cupón ${codigo} eliminado.`);
  }

  async cambiarEstado(folio: string, estado: string): Promise<void> {
    await this.authService.cambiarEstadoPedido(folio, estado);
    if (this.pedidoSeleccionado?.folio === folio) {
      this.pedidoSeleccionado = { ...this.pedidoSeleccionado, estado };
    }
    this.notificar(`Pedido ${folio} actualizado a "${estado}".`);
  }

  async recargarPedidos(): Promise<void> {
    await this.authService.cargarTodosLosPedidos();
    this.notificar('Lista de pedidos actualizada desde Firestore.');
  }

  abrirDetallePedido(pedido: any): void {
    this.pedidoSeleccionado = pedido;
  }

  cerrarDetallePedido(): void {
    this.pedidoSeleccionado = null;
  }

  imagenPorDefecto(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/120x120/fce4ec/df5c8e?text=VR';
  }

  private notificar(texto: string): void {
    this.mensajeExito = texto;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }
}