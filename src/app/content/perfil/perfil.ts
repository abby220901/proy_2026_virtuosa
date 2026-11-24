import { Component, OnInit, effect, inject } from '@angular/core';
import { AuthService, PerfilCliente } from '../../services/auth';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  // =========================================================================
  // SERVICIOS Y ESTADO DEL COMPONENTE
  // =========================================================================

  public authService = inject(AuthService);

  cargando: boolean = true;
  guardando: boolean = false;
  editandoDireccion: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  perfil: PerfilCliente = {
    uid: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    calleNumero: '',
    colonia: '',
    codigoPostal: '',
    ciudad: 'Nuevo Laredo',
    estado: 'Tamaulipas',
    referencias: ''
  };

  // =========================================================================
  // CICLO DE VIDA Y SINCRONIZACIÓN DE SESIÓN
  // =========================================================================

  constructor() {
    effect(() => {
      const user = this.authService.usuarioActual();
      if (user) {
        this.cargarDatosPerfil();
      } else {
        this.cargando = false;
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.usuarioActual()) {
      this.cargarDatosPerfil();
    } else {
      this.cargando = false;
    }
  }

  async cargarDatosPerfil(): Promise<void> {
    this.cargando = true;
    const datos = await this.authService.obtenerPerfilCliente();
    if (datos) {
      this.perfil = { ...datos };
      await this.authService.cargarPedidosUsuario(datos.uid);
    }
    this.cargando = false;
  }

  // =========================================================================
  // EDICIÓN Y GUARDADO DE DATOS PERSONALES Y DIRECCIÓN
  // =========================================================================

  alternarEdicionDireccion(): void {
    this.editandoDireccion = !this.editandoDireccion;
    this.mensajeError = '';
  }

  async guardarCambios(): Promise<void> {
    if (!this.perfil.nombre.trim()) {
      this.mensajeError = 'El nombre no puede quedar vacío.';
      return;
    }

    if (
      this.perfil.codigoPostal.trim() &&
      !/^\d{5}$/.test(this.perfil.codigoPostal.trim())
    ) {
      this.mensajeError = 'El código postal debe tener exactamente 5 dígitos.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const res = await this.authService.actualizarPerfilCliente(this.perfil);

    this.guardando = false;
    if (res.ok) {
      this.editandoDireccion = false;
      this.mensajeExito = res.mensaje;
      setTimeout(() => {
        this.mensajeExito = '';
      }, 3500);
    } else {
      this.mensajeError = res.mensaje;
    }
  }

  get direccionResumida(): string {
    if (!this.perfil.calleNumero && !this.perfil.colonia && !this.perfil.codigoPostal) {
      return 'Aún no has registrado una dirección de entrega.';
    }
    return `${this.perfil.calleNumero}, Col. ${this.perfil.colonia}, C.P. ${this.perfil.codigoPostal}, ${this.perfil.ciudad}, ${this.perfil.estado}`;
  }
}