import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./naologic/naologic').then((m) => m.NaologicComponent),
  },
];
