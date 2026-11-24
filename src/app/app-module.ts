import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// 1. Imports de Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { App } from './app';
import { Content } from './content/content';
import { Header } from './header/header';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { Login } from './login/login';
import { Signin } from './signin/signin';
import { Inicio } from './content/inicio/inicio';
import { Favoritos } from './content/favoritos/favoritos';
import { Categorias } from './content/categorias/categorias';
import { Carrito } from './content/carrito/carrito';
import { Legal } from './legal/legal';
import { Cupones } from './content/cupones/cupones';
import { Admin } from './admin/admin';
import { Perfil } from './content/perfil/perfil';

const appRoutes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'login', component: Login },
  { path: 'signin', component: Signin },
  { path: 'favoritos', component: Favoritos },
  { path: 'cupones', component: Cupones },
  { path: 'admin', component: Admin },
  { path: 'perfil', component: Perfil },
  { path: 'categorias', component: Categorias },
  { path: 'carrito', component: Carrito },
  { path: 'legal', component: Legal }
];

@NgModule({
  declarations: [
    App,
    Content,
    Header,
    Navbar,
    Footer,
    Login,
    Signin,
    Inicio,
    Favoritos,
    Categorias,
    Carrito,
    Legal,
    Cupones,
    Admin,
    Perfil
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    // 2. Proveedores obligatorios de Firebase:
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [App]
})
export class AppModule { }