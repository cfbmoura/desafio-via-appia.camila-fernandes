import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ListComponent } from './features/books/list/list.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'books', component: ListComponent }

];
