import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal',
  standalone: false,
  templateUrl: './legal.html',
  styleUrl: './legal.css'
})
export class Legal implements OnInit {
  private route = inject(ActivatedRoute);
  seccionActiva: string = 'terminos';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['seccion']) {
        this.seccionActiva = params['seccion'];
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }
}