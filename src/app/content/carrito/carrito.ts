import { Component, OnInit, effect, inject } from '@angular/core';
import { AuthService, ItemCarrito } from '../../services/auth';

// =========================================================================
// INTERFACES DE ENVÍO Y PAGO CON TARJETA / OXXO / TRANSFERENCIA
// =========================================================================

export interface DatosTarjetaDebito {
  numeroTarjeta: string;
  nombreTitular: string;
  vencimiento: string;
  codigoSeguridad: string;
}

export interface DatosEnvioPago {
  nombreReceptor: string;
  telefono: string;
  calleNumero: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  referencias: string;
  metodoPago: 'tarjeta' | 'oxxo' | 'transferencia';
  tarjeta: DatosTarjetaDebito;
}

@Component({
  selector: 'app-carrito',
  standalone: false,
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {
  // =========================================================================
  // SERVICIOS Y ESTADO DEL COMPONENTE
  // =========================================================================

  public authService = inject(AuthService);

  itemsCarrito: ItemCarrito[] = [];

  // Control de sección desplegable de domicilio y método de pago
  mostrarSeccionCheckout: boolean = false;
  datosGuardadosConfirmados: boolean = false;
  mostrarAyudaCvv: boolean = false;

  // Estados del proceso de compra
  procesandoPedido: boolean = false;
  compraRealizada: boolean = false;
  folioPedido: string = '';
  pedidoConfirmado: any | null = null;

  // Mensajes de interfaz
  mensajeExito: string = '';
  mensajeError: string = '';

  // Estado de cupones de descuento
  codigoInput: string = '';
  mensajeCupon: string = '';
  porcentajeDescuento: number = 0;
  cuponAplicado: { codigo: string; porcentaje: number } | null = null;

  // Desplegables de mes (MM) y año (AA) para el vencimiento de la tarjeta
  mesVencimientoSeleccionado: string = '';
  anioVencimientoSeleccionado: string = '';

  readonly mesesVencimiento: string[] = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];

  readonly aniosVencimiento: string[] = Array.from({ length: 12 }, (_, idx) =>
    String((new Date().getFullYear() + idx) % 100).padStart(2, '0')
  );

  // Modelo del formulario de domicilio, código postal y método de pago
  datosCheckout: DatosEnvioPago = {
    nombreReceptor: '',
    telefono: '',
    calleNumero: '',
    colonia: '',
    ciudad: 'Nuevo Laredo',
    estado: 'Tamaulipas',
    codigoPostal: '',
    referencias: '',
    metodoPago: 'oxxo',
    tarjeta: {
      numeroTarjeta: '',
      nombreTitular: '',
      vencimiento: '',
      codigoSeguridad: ''
    }
  };

  // =========================================================================
  // CICLO DE VIDA Y SINCRONIZACIÓN REACTIVA
  // =========================================================================

  constructor() {
    effect(() => {
      this.itemsCarrito = [...this.authService.carritoUsuario()];
      if (!this.datosCheckout.nombreReceptor && this.authService.estaAutenticado()) {
        this.datosCheckout.nombreReceptor = this.authService.obtenerNombreVisible();
      }
    });
  }

  ngOnInit(): void {
    this.itemsCarrito = [...this.authService.carritoUsuario()];
    this.cargarDatosGuardados();
    if (!this.datosCheckout.nombreReceptor && this.authService.estaAutenticado()) {
      this.datosCheckout.nombreReceptor = this.authService.obtenerNombreVisible();
    }
  }

  // =========================================================================
  // FORMATEO DE TARJETA DE DÉBITO (NÚMERO, DESPLEGABLES MM/AA, CVV)
  // =========================================================================

  formatearNumeroTarjeta(): void {
    const digitos = this.datosCheckout.tarjeta.numeroTarjeta.replace(/\D/g, '').slice(0, 16);
    const grupos = digitos.match(/.{1,4}/g) || [];
    this.datosCheckout.tarjeta.numeroTarjeta = grupos.join(' ');
  }

  actualizarVencimientoSelect(): void {
    if (this.mesVencimientoSeleccionado && this.anioVencimientoSeleccionado) {
      this.datosCheckout.tarjeta.vencimiento =
        `${this.mesVencimientoSeleccionado}/${this.anioVencimientoSeleccionado}`;
    } else {
      this.datosCheckout.tarjeta.vencimiento = '';
    }
  }

  formatearCodigoSeguridad(): void {
    this.datosCheckout.tarjeta.codigoSeguridad = this.datosCheckout.tarjeta.codigoSeguridad
      .replace(/\D/g, '')
      .slice(0, 4);
  }

  get numeroTarjetaVista(): string {
    return this.datosCheckout.tarjeta.numeroTarjeta.trim() || '0000 0000 0000 0000';
  }

  get titularTarjetaVista(): string {
    return this.datosCheckout.tarjeta.nombreTitular.trim().toUpperCase() || 'NOMBRE DEL TITULAR';
  }

  get vencimientoTarjetaVista(): string {
    return this.datosCheckout.tarjeta.vencimiento.trim() || 'MM/AA';
  }

  get ultimosCuatroDigitos(): string {
    const soloDigitos = this.datosCheckout.tarjeta.numeroTarjeta.replace(/\D/g, '');
    return soloDigitos.slice(-4) || '0000';
  }

  // =========================================================================
  // DOMICILIO, CÓDIGO POSTAL Y GUARDADO DE MÉTODO DE PAGO
  // =========================================================================

  private get claveStorageCheckout(): string {
    const correo = this.authService.usuarioActual()?.email || 'invitado';
    return `virtuosa_checkout_${correo}`;
  }

  cargarDatosGuardados(): void {
    try {
      const guardado = localStorage.getItem(this.claveStorageCheckout);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        this.datosCheckout = {
          ...this.datosCheckout,
          ...parsed,
          tarjeta: {
            ...this.datosCheckout.tarjeta,
            ...(parsed.tarjeta || {})
          }
        };
        if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.datosCheckout.tarjeta.vencimiento)) {
          const [mes, anio] = this.datosCheckout.tarjeta.vencimiento.split('/');
          this.mesVencimientoSeleccionado = mes;
          this.anioVencimientoSeleccionado = anio;
        }
        if (this.datosCheckout.calleNumero && this.datosCheckout.codigoPostal) {
          this.datosGuardadosConfirmados = true;
        }
      }
    } catch {}
  }

  abrirSeccionCheckout(): void {
    this.mostrarSeccionCheckout = !this.mostrarSeccionCheckout;
    this.mensajeError = '';
  }

  guardarDatosEnvioPago(): void {
    if (
      !this.datosCheckout.nombreReceptor.trim() ||
      !this.datosCheckout.calleNumero.trim() ||
      !this.datosCheckout.colonia.trim() ||
      !this.datosCheckout.codigoPostal.trim() ||
      this.datosCheckout.codigoPostal.trim().length < 5
    ) {
      this.mensajeError = 'Completa nombre, calle y número, colonia y un código postal válido de 5 dígitos.';
      return;
    }

    if (this.datosCheckout.metodoPago === 'tarjeta') {
      const digitosTarjeta = this.datosCheckout.tarjeta.numeroTarjeta.replace(/\D/g, '');
      const vencValido = /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.datosCheckout.tarjeta.vencimiento.trim());
      const cvvValido = /^\d{3,4}$/.test(this.datosCheckout.tarjeta.codigoSeguridad.trim());

      if (
        digitosTarjeta.length < 16 ||
        !this.datosCheckout.tarjeta.nombreTitular.trim() ||
        !vencValido ||
        !cvvValido
      ) {
        this.mensajeError = 'Completa los 16 dígitos de la tarjeta, nombre del titular, vencimiento (mes y año) y código de seguridad.';
        return;
      }
    }

    this.mensajeError = '';
    localStorage.setItem(this.claveStorageCheckout, JSON.stringify(this.datosCheckout));
    this.datosGuardadosConfirmados = true;
    this.notificar('Domicilio y método de pago guardados correctamente.');
  }

  get etiquetaMetodoPago(): string {
    if (this.datosCheckout.metodoPago === 'oxxo') return 'Pago en efectivo en OXXO';
    if (this.datosCheckout.metodoPago === 'transferencia') return 'Transferencia Electrónica (SPEI)';
    return `Tarjeta de débito •••• ${this.ultimosCuatroDigitos}`;
  }

  // =========================================================================
  // CÁLCULOS DE SUBTOTAL, DESCUENTO, ENVÍO Y TOTAL
  // =========================================================================

  get cantidadTotal(): number {
    return this.itemsCarrito.reduce((acc, item) => acc + Number(item.cantidad || 1), 0);
  }

  get subtotal(): number {
    return this.itemsCarrito.reduce(
      (acc, item) => acc + Number(item.precio || 0) * Number(item.cantidad || 1),
      0
    );
  }

  get montoDescuento(): number {
    return Math.round((this.subtotal * this.porcentajeDescuento) / 100);
  }

  get faltanteEnvioGratis(): number {
    const baseParaEnvio = Math.max(0, this.subtotal - this.montoDescuento);
    return Math.max(0, 599 - baseParaEnvio);
  }

  get costoEnvio(): number {
    if (this.subtotal === 0) return 0;
    return this.faltanteEnvioGratis === 0 ? 0 : 99;
  }

  get totalFinal(): number {
    return Math.max(0, this.subtotal - this.montoDescuento + this.costoEnvio);
  }

  // =========================================================================
  // CUPONES DE DESCUENTO
  // =========================================================================

  aplicarCupon(): void {
    const code = this.codigoInput.trim().toUpperCase();
    if (!code) return;

    const cuponAdmin = this.authService.cuponesAdmin().find((c: any) => c.codigo.toUpperCase() === code);
    if (cuponAdmin) {
      if (this.subtotal < cuponAdmin.minimoCompra) {
        this.mensajeCupon = `Este cupón requiere una compra mínima de $${cuponAdmin.minimoCompra}.00 MXN.`;
        return;
      }
      this.porcentajeDescuento = cuponAdmin.porcentaje;
      this.cuponAplicado = { codigo: cuponAdmin.codigo, porcentaje: cuponAdmin.porcentaje };
      this.mensajeCupon = `Cupón ${code} aplicado (${cuponAdmin.porcentaje}% de descuento).`;
      return;
    }

    if (code === 'VIRTUOSA10') {
      this.porcentajeDescuento = 10;
      this.cuponAplicado = { codigo: code, porcentaje: 10 };
      this.mensajeCupon = 'Cupón VIRTUOSA10 aplicado (10% de descuento).';
    } else if (code === 'GLOW15' && this.subtotal >= 400) {
      this.porcentajeDescuento = 15;
      this.cuponAplicado = { codigo: code, porcentaje: 15 };
      this.mensajeCupon = 'Cupón GLOW15 aplicado (15% de descuento).';
    } else {
      this.mensajeCupon = 'Cupón no válido o no cumple con el monto mínimo de compra.';
    }
  }

  quitarCupon(): void {
    this.cuponAplicado = null;
    this.porcentajeDescuento = 0;
    this.codigoInput = '';
    this.mensajeCupon = '';
  }

  // =========================================================================
  // ACCIONES SOBRE ARTÍCULOS Y FINALIZACIÓN DE COMPRA
  // =========================================================================

  async cambiarCantidad(item: ItemCarrito, delta: number): Promise<void> {
    await this.authService.cambiarCantidadCarrito(item.sku, delta);
  }

  async eliminarItem(sku: string): Promise<void> {
    await this.authService.eliminarDelCarrito(sku);
  }

  async vaciarCarritoLocal(): Promise<void> {
    this.quitarCupon();
    await this.authService.vaciarCarrito();
  }

  async finalizarCompra(): Promise<void> {
    if (!this.authService.estaAutenticado()) {
      this.mensajeError = 'Inicia sesión para finalizar tu pedido.';
      return;
    }

    if (!this.datosGuardadosConfirmados) {
      this.mostrarSeccionCheckout = true;
      this.mensajeError = 'Por favor guarda tu domicilio y método de pago antes de confirmar el pedido.';
      return;
    }

    this.procesandoPedido = true;
    this.mensajeError = '';

    const folioGenerado = `VR-${Date.now().toString().slice(-6)}`;
    const referenciaOxxo =
      this.datosCheckout.metodoPago === 'oxxo'
        ? `9300-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-48`
        : '';

    const direccionCompleta = `${this.datosCheckout.calleNumero}, Col. ${this.datosCheckout.colonia}, C.P. ${this.datosCheckout.codigoPostal}, ${this.datosCheckout.ciudad}, ${this.datosCheckout.estado}`;

    await this.authService.registrarPedido(
      folioGenerado,
      this.totalFinal,
      this.montoDescuento,
      this.costoEnvio,
      {
        telefono: this.datosCheckout.telefono,
        direccionEntrega: direccionCompleta,
        codigoPostal: this.datosCheckout.codigoPostal,
        referencias: this.datosCheckout.referencias,
        metodoPago: this.etiquetaMetodoPago,
        referenciaOxxo,
        subtotal: this.subtotal
      }
    );

    await this.authService.vaciarCarrito();
    this.quitarCupon();

    this.procesandoPedido = false;
    this.compraRealizada = true;
    this.folioPedido = folioGenerado;
    this.pedidoConfirmado = {
      folio: folioGenerado,
      nombreCliente: this.datosCheckout.nombreReceptor,
      direccionEntrega: direccionCompleta,
      metodoPago: this.etiquetaMetodoPago,
      referenciaOxxo,
      total: this.totalFinal
    };
    this.mostrarSeccionCheckout = false;
  }

  // =========================================================================
  // UTILIDADES VISUALES
  // =========================================================================

  imagenPorDefecto(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/120x120/fce4ec/df5c8e?text=VR';
  }

  private notificar(msg: string): void {
    this.mensajeExito = msg;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3500);
  }
}