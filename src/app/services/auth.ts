import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc
} from '@angular/fire/firestore';

// =========================================================================
// INTERFACES Y MODELOS DE DATOS
// =========================================================================

export interface DatosUsuario {
  uid?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaRegistro?: string;
}

export interface PerfilCliente {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  calleNumero: string;
  colonia: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  referencias: string;
}

export interface ItemCarrito {
  sku: string;
  nombre: string;
  categoriaNombre: string;
  precio: number;
  stock: number;
  tono?: string;
  imagen: string;
  cantidad: number;
}

export interface DetallesEnvioPagoPedido {
  telefono?: string;
  direccionEntrega?: string;
  codigoPostal?: string;
  referencias?: string;
  metodoPago?: string;
  referenciaOxxo?: string;
  subtotal?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // =========================================================================
  // INYECCIÓN DE DEPENDENCIAS Y ESTADO REACTIVO (SIGNALS)
  // =========================================================================

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Correo designado como Administrador
  readonly CORREO_ADMIN = 'admin_virtuosa@gmail.com';

  usuarioActual = signal<User | null>(null);
  esAdmin = signal<boolean>(false);

  favoritosUsuario = signal<any[]>([]);
  carritoUsuario = signal<ItemCarrito[]>([]);
  pedidosUsuario = signal<any[]>([]);

  // Datos administrables desde Firestore
  productosAdmin = signal<any[]>([]);
  cuponesAdmin = signal<any[]>([]);
  pedidosGlobales = signal<any[]>([]);

  cantidadTotalCarrito = computed(() =>
    this.carritoUsuario().reduce((acc, item) => acc + item.cantidad, 0)
  );

  subtotalCarrito = computed(() =>
    this.carritoUsuario().reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  );

  // =========================================================================
  // CONSTRUCTOR Y OBSERVADOR DE SESIÓN
  // =========================================================================

  constructor() {
    this.cargarCarritoLocal();
    this.cargarCatalogoAdmin();
    this.cargarCuponesAdmin();

    onAuthStateChanged(this.auth, async (user) => {
      this.usuarioActual.set(user);
      const adminActivo = user?.email?.toLowerCase() === this.CORREO_ADMIN;
      this.esAdmin.set(adminActivo);

      if (user) {
        await this.cargarFavoritosUsuario(user.uid);
        await this.cargarCarritoUsuario(user.uid);
        await this.cargarPedidosUsuario(user.uid);
        if (adminActivo) {
          await this.cargarTodosLosPedidos();
        }
      } else {
        this.favoritosUsuario.set([]);
        this.pedidosUsuario.set([]);
        this.pedidosGlobales.set([]);
        this.cargarCarritoLocal();
      }
    });
  }

  // =========================================================================
  // AUTENTICACIÓN Y GESTIÓN DE CUENTA
  // =========================================================================

  async registrarUsuario(datos: DatosUsuario, password: string): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const emailLimpio = datos.email.trim().toLowerCase();
      const credencial = await createUserWithEmailAndPassword(this.auth, emailLimpio, password);

      await updateProfile(credencial.user, {
        displayName: `${datos.nombre} ${datos.apellido}`
      });

      const refUsuario = doc(this.firestore, `usuarios/${credencial.user.uid}`);
      await setDoc(refUsuario, {
        uid: credencial.user.uid,
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: emailLimpio,
        rol: emailLimpio === this.CORREO_ADMIN ? 'admin' : 'cliente',
        telefono: datos.telefono || '',
        fechaRegistro: new Date().toISOString()
      });

      this.usuarioActual.set(credencial.user);
      this.esAdmin.set(emailLimpio === this.CORREO_ADMIN);
      return { ok: true, mensaje: '¡Cuenta creada con éxito! Redirigiendo...' };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return { ok: false, mensaje: 'Este correo electrónico ya está registrado.' };
      }
      if (error.code === 'auth/weak-password') {
        return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
      }
      return { ok: false, mensaje: 'Error al registrar la cuenta. Verifica que Authentication esté habilitado.' };
    }
  }

  async iniciarSesion(email: string, password: string): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const emailLimpio = email.trim().toLowerCase();
      const credencial = await signInWithEmailAndPassword(this.auth, emailLimpio, password);
      this.usuarioActual.set(credencial.user);

      const adminActivo = emailLimpio === this.CORREO_ADMIN;
      this.esAdmin.set(adminActivo);

      await this.cargarFavoritosUsuario(credencial.user.uid);
      await this.cargarCarritoUsuario(credencial.user.uid);
      await this.cargarPedidosUsuario(credencial.user.uid);
      if (adminActivo) {
        await this.cargarTodosLosPedidos();
      }
      return { ok: true, mensaje: '¡Bienvenida! Cargando tu sesión...' };
    } catch (error: any) {
      return { ok: false, mensaje: 'Correo electrónico o contraseña incorrectos.' };
    }
  }

  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }

  obtenerNombreVisible(): string {
    const user = this.usuarioActual();
    if (!user) return '';
    if (this.esAdmin()) {
      return user.displayName || 'Administrador Virtuosa';
    }
    return user.displayName?.split(' ')[0] || user.email || 'Cliente';
  }

  async cerrarSesion(): Promise<void> {
    await signOut(this.auth);
    this.usuarioActual.set(null);
    this.esAdmin.set(false);
    this.favoritosUsuario.set([]);
    this.carritoUsuario.set([]);
    this.pedidosUsuario.set([]);
    this.pedidosGlobales.set([]);
    localStorage.removeItem('virtuosa_carrito');
  }

  // =========================================================================
  // PERFIL DE CLIENTE Y PEDIDOS DEL USUARIO
  // =========================================================================

  async obtenerPerfilCliente(): Promise<PerfilCliente | null> {
    const user = this.usuarioActual();
    if (!user) return null;

    let docData: any = {};
    try {
      const snap = await getDocs(collection(this.firestore, 'usuarios'));
      const encontrado = snap.docs.find(d => d.id === user.uid);
      if (encontrado) {
        docData = encontrado.data();
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
    }

    let checkoutLocal: any = {};
    try {
      const rawLocal = localStorage.getItem(`virtuosa_checkout_${user.email || 'invitado'}`);
      if (rawLocal) {
        checkoutLocal = JSON.parse(rawLocal);
      }
    } catch {}

    const nombrePartes = (user.displayName || '').trim().split(/\s+/);
    const nombreBase = docData.nombre || nombrePartes[0] || '';
    const apellidoBase = docData.apellido || nombrePartes.slice(1).join(' ') || '';

    return {
      uid: user.uid,
      nombre: nombreBase,
      apellido: apellidoBase,
      email: user.email || docData.email || '',
      telefono: docData.telefono ?? checkoutLocal.telefono ?? '',
      calleNumero: docData.calleNumero ?? checkoutLocal.calleNumero ?? '',
      colonia: docData.colonia ?? checkoutLocal.colonia ?? '',
      codigoPostal: docData.codigoPostal ?? checkoutLocal.codigoPostal ?? '',
      ciudad: docData.ciudad ?? checkoutLocal.ciudad ?? 'Nuevo Laredo',
      estado: docData.estado ?? checkoutLocal.estado ?? 'Tamaulipas',
      referencias: docData.referencias ?? checkoutLocal.referencias ?? ''
    };
  }

  async actualizarPerfilCliente(perfil: PerfilCliente): Promise<{ ok: boolean; mensaje: string }> {
    const user = this.usuarioActual();
    if (!user) {
      return { ok: false, mensaje: 'Debes iniciar sesión para guardar cambios.' };
    }

    try {
      const nombreLimpio = perfil.nombre.trim();
      const apellidoLimpio = perfil.apellido.trim();

      await updateProfile(user, {
        displayName: `${nombreLimpio} ${apellidoLimpio}`.trim()
      });

      const refUsuario = doc(this.firestore, `usuarios/${user.uid}`);
      await setDoc(
        refUsuario,
        {
          uid: user.uid,
          nombre: nombreLimpio,
          apellido: apellidoLimpio,
          email: user.email || perfil.email,
          telefono: perfil.telefono.trim(),
          calleNumero: perfil.calleNumero.trim(),
          colonia: perfil.colonia.trim(),
          codigoPostal: perfil.codigoPostal.trim(),
          ciudad: perfil.ciudad.trim(),
          estado: perfil.estado.trim(),
          referencias: perfil.referencias.trim()
        },
        { merge: true }
      );

      const claveCheckout = `virtuosa_checkout_${user.email || 'invitado'}`;
      let checkoutActual: any = {};
      try {
        checkoutActual = JSON.parse(localStorage.getItem(claveCheckout) || '{}');
      } catch {}

      localStorage.setItem(
        claveCheckout,
        JSON.stringify({
          ...checkoutActual,
          nombreReceptor: `${nombreLimpio} ${apellidoLimpio}`.trim(),
          telefono: perfil.telefono.trim(),
          calleNumero: perfil.calleNumero.trim(),
          colonia: perfil.colonia.trim(),
          codigoPostal: perfil.codigoPostal.trim(),
          ciudad: perfil.ciudad.trim(),
          estado: perfil.estado.trim(),
          referencias: perfil.referencias.trim()
        })
      );

      this.usuarioActual.set({ ...user } as User);
      return { ok: true, mensaje: 'Datos personales y dirección actualizados correctamente.' };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return { ok: false, mensaje: 'No se pudieron guardar los cambios en tu perfil.' };
    }
  }

  async cargarPedidosUsuario(uid: string): Promise<void> {
    try {
      const ref = collection(this.firestore, 'pedidos');
      const snapshot = await getDocs(ref);
      const propios = snapshot.docs
        .map(d => d.data())
        .filter((p: any) => p.uidCliente === uid);

      propios.sort((a: any, b: any) => (b.fecha || '').localeCompare(a.fecha || ''));
      this.pedidosUsuario.set(propios);
    } catch (error) {
      console.error('Error al cargar pedidos del usuario:', error);
    }
  }

  // =========================================================================
  // FAVORITOS COMPARTIDOS (POR SKU)
  // =========================================================================

  async cargarFavoritosUsuario(uid: string): Promise<void> {
    try {
      const ref = collection(this.firestore, `usuarios/${uid}/favoritos`);
      const snapshot = await getDocs(ref);
      this.favoritosUsuario.set(snapshot.docs.map(d => d.data()));
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  }

  esFavorito(sku: string): boolean {
    return this.favoritosUsuario().some(p => p.sku === sku);
  }

  async toggleFavorito(producto: any, event?: Event): Promise<boolean> {
    if (event) event.stopPropagation();

    const usuario = this.usuarioActual();
    if (!usuario) return false;

    const docRef = doc(this.firestore, `usuarios/${usuario.uid}/favoritos/${producto.sku}`);

    if (this.esFavorito(producto.sku)) {
      await deleteDoc(docRef);
      this.favoritosUsuario.update(lista => lista.filter(p => p.sku !== producto.sku));
    } else {
      const nuevoFav = {
        ...producto,
        fechaAgregado: new Date().toISOString()
      };
      await setDoc(docRef, nuevoFav);
      this.favoritosUsuario.update(lista => [...lista, nuevoFav]);
    }
    return true;
  }

  // =========================================================================
  // CARRITO DE COMPRAS Y REGISTRO DE PEDIDOS
  // =========================================================================

  private cargarCarritoLocal(): void {
    const guardado = localStorage.getItem('virtuosa_carrito');
    if (guardado) {
      try {
        this.carritoUsuario.set(JSON.parse(guardado));
      } catch {
        this.carritoUsuario.set([]);
      }
    } else {
      this.carritoUsuario.set([]);
    }
  }

  private guardarCarritoLocal(lista: ItemCarrito[]): void {
    localStorage.setItem('virtuosa_carrito', JSON.stringify(lista));
  }

  async cargarCarritoUsuario(uid: string): Promise<void> {
    try {
      const ref = collection(this.firestore, `usuarios/${uid}/carrito`);
      const snapshot = await getDocs(ref);
      this.carritoUsuario.set(snapshot.docs.map(d => d.data() as ItemCarrito));
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  }

  async agregarAlCarrito(producto: any, event?: Event): Promise<{ ok: boolean; mensaje: string }> {
    if (event) event.stopPropagation();

    const stockDisponible = producto.stock ?? 10;
    if (stockDisponible <= 0) {
      return { ok: false, mensaje: 'Este producto está agotado.' };
    }

    const listaActual = [...this.carritoUsuario()];
    const indice = listaActual.findIndex(item => item.sku === producto.sku);
    let itemActualizado: ItemCarrito;

    if (indice > -1) {
      if (listaActual[indice].cantidad >= stockDisponible) {
        return { ok: false, mensaje: `Solo hay ${stockDisponible} piezas disponibles.` };
      }
      itemActualizado = {
        ...listaActual[indice],
        cantidad: listaActual[indice].cantidad + 1
      };
      listaActual[indice] = itemActualizado;
    } else {
      itemActualizado = {
        sku: producto.sku,
        nombre: producto.nombre,
        categoriaNombre: producto.categoriaNombre || 'Cosméticos',
        precio: producto.precio,
        stock: stockDisponible,
        tono: producto.tono || '',
        imagen: producto.imagen,
        cantidad: 1
      };
      listaActual.push(itemActualizado);
    }

    this.carritoUsuario.set(listaActual);

    const usuario = this.usuarioActual();
    if (usuario) {
      const docRef = doc(this.firestore, `usuarios/${usuario.uid}/carrito/${itemActualizado.sku}`);
      await setDoc(docRef, itemActualizado);
    } else {
      this.guardarCarritoLocal(listaActual);
    }

    return { ok: true, mensaje: `🛒 "${producto.nombre}" se agregó al carrito.` };
  }

  async cambiarCantidadCarrito(sku: string, delta: number): Promise<void> {
    const listaActual = [...this.carritoUsuario()];
    const indice = listaActual.findIndex(item => item.sku === sku);
    if (indice === -1) return;

    const nuevaCantidad = listaActual[indice].cantidad + delta;
    if (nuevaCantidad <= 0) {
      await this.eliminarDelCarrito(sku);
      return;
    }
    if (nuevaCantidad > listaActual[indice].stock) return;

    const itemActualizado: ItemCarrito = {
      ...listaActual[indice],
      cantidad: nuevaCantidad
    };
    listaActual[indice] = itemActualizado;
    this.carritoUsuario.set(listaActual);

    const usuario = this.usuarioActual();
    if (usuario) {
      const docRef = doc(this.firestore, `usuarios/${usuario.uid}/carrito/${sku}`);
      await setDoc(docRef, itemActualizado);
    } else {
      this.guardarCarritoLocal(listaActual);
    }
  }

  async eliminarDelCarrito(sku: string): Promise<void> {
    const listaActual = this.carritoUsuario().filter(item => item.sku !== sku);
    this.carritoUsuario.set(listaActual);

    const usuario = this.usuarioActual();
    if (usuario) {
      const docRef = doc(this.firestore, `usuarios/${usuario.uid}/carrito/${sku}`);
      await deleteDoc(docRef);
    } else {
      this.guardarCarritoLocal(listaActual);
    }
  }

  async vaciarCarrito(): Promise<void> {
    const usuario = this.usuarioActual();
    if (usuario) {
      for (const item of this.carritoUsuario()) {
        const docRef = doc(this.firestore, `usuarios/${usuario.uid}/carrito/${item.sku}`);
        await deleteDoc(docRef);
      }
    } else {
      localStorage.removeItem('virtuosa_carrito');
    }
    this.carritoUsuario.set([]);
  }

  async registrarPedido(
    folio: string,
    total: number,
    descuento: number,
    envio: number,
    detallesEnvioPago?: DetallesEnvioPagoPedido
  ): Promise<void> {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    const pedido = {
      folio,
      uidCliente: usuario.uid,
      nombreCliente: usuario.displayName || usuario.email,
      correoCliente: usuario.email,
      telefono: detallesEnvioPago?.telefono || '',
      direccionEntrega: detallesEnvioPago?.direccionEntrega || '',
      codigoPostal: detallesEnvioPago?.codigoPostal || '',
      referencias: detallesEnvioPago?.referencias || '',
      metodoPago: detallesEnvioPago?.metodoPago || '',
      referenciaOxxo: detallesEnvioPago?.referenciaOxxo || '',
      productos: this.carritoUsuario(),
      subtotal: detallesEnvioPago?.subtotal ?? total + descuento - envio,
      descuento,
      envio,
      total,
      estado: 'Pendiente',
      fecha: new Date().toISOString()
    };

    const docRef = doc(this.firestore, `pedidos/${folio}`);
    await setDoc(docRef, pedido);
    await this.cargarPedidosUsuario(usuario.uid);
  }

  // =========================================================================
  // FUNCIONES EXCLUSIVAS DEL ADMINISTRADOR
  // =========================================================================

  async cargarCatalogoAdmin(): Promise<void> {
    try {
      const ref = collection(this.firestore, 'productos_admin');
      const snapshot = await getDocs(ref);
      this.productosAdmin.set(snapshot.docs.map(d => d.data()));
    } catch (error) {
      console.error('Error al cargar productos admin:', error);
    }
  }

  async guardarProductoAdmin(producto: any): Promise<void> {
    const docRef = doc(this.firestore, `productos_admin/${producto.sku}`);
    await setDoc(docRef, producto);
    await this.cargarCatalogoAdmin();
  }

  async eliminarProductoAdmin(sku: string): Promise<void> {
    const docRef = doc(this.firestore, `productos_admin/${sku}`);
    await deleteDoc(docRef);
    await this.cargarCatalogoAdmin();
  }

  async cargarCuponesAdmin(): Promise<void> {
    try {
      const ref = collection(this.firestore, 'cupones_admin');
      const snapshot = await getDocs(ref);
      this.cuponesAdmin.set(snapshot.docs.map(d => d.data()));
    } catch (error) {
      console.error('Error al cargar cupones admin:', error);
    }
  }

  async guardarCuponAdmin(cupon: any): Promise<void> {
    const codigoLimpio = cupon.codigo.trim().toUpperCase();
    const docRef = doc(this.firestore, `cupones_admin/${codigoLimpio}`);
    await setDoc(docRef, { ...cupon, codigo: codigoLimpio });
    await this.cargarCuponesAdmin();
  }

  async eliminarCuponAdmin(codigo: string): Promise<void> {
    const docRef = doc(this.firestore, `cupones_admin/${codigo}`);
    await deleteDoc(docRef);
    await this.cargarCuponesAdmin();
  }

  async cargarTodosLosPedidos(): Promise<void> {
    try {
      const ref = collection(this.firestore, 'pedidos');
      const snapshot = await getDocs(ref);
      const lista = snapshot.docs.map(d => d.data());
      this.pedidosGlobales.set(lista.sort((a: any, b: any) => b.fecha.localeCompare(a.fecha)));
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  }

  async cambiarEstadoPedido(folio: string, nuevoEstado: string): Promise<void> {
    const docRef = doc(this.firestore, `pedidos/${folio}`);
    await updateDoc(docRef, { estado: nuevoEstado });
    this.pedidosGlobales.update(lista =>
      lista.map(p => (p.folio === folio ? { ...p, estado: nuevoEstado } : p))
    );
  }
}