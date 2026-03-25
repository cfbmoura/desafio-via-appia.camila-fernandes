import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthPayload {
  login: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface PagedResponse<T> {
  content: T[];
}

export interface Book {
  id: string;
  title: string;
  gender: string;
  year: number;
  active: boolean;
  author?: string | { id?: string; name?: string };
}

export interface Author {
  id: string;
  name: string;
  nationality?: string;
  active?: boolean;
}

export interface BookPayload {
  title: string;
  gender: string;
  year: number;
  author?: {
    id: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = 'http://desafio.viaapia.com.br:8245';

  private getAuthHeaders() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;

    return new HttpHeaders(token ? {
      Authorization: `Bearer ${token}`
    } : {});
  }

  login(data: AuthPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data);
  }

  register(data: AuthPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/register`, data);
  }


  getBooks(): Observable<PagedResponse<Book>> {
    const headers = this.getAuthHeaders();

    return this.http.get<PagedResponse<Book>>(`${this.baseUrl}/book/active`, { headers });
  }

  getAuthors(): Observable<PagedResponse<Author>> {
    const headers = this.getAuthHeaders();

    return this.http.get<PagedResponse<Author>>(`${this.baseUrl}/author`, { headers });
  }

  saveBook(data: BookPayload): Observable<Book> {
    const headers = this.getAuthHeaders();

    return this.http.post<Book>(`${this.baseUrl}/book`, data, { headers });
  }

  updateBook(id: string, data: BookPayload): Observable<Book> {
    const headers = this.getAuthHeaders();

    return this.http.put<Book>(`${this.baseUrl}/book/${id}`, data, { headers });
  }

  deleteBook(id: string): Observable<unknown> {
    const headers = this.getAuthHeaders();

    return this.http.delete<unknown>(`${this.baseUrl}/book/${id}`, { headers });
  }

  searchBooksByYear(year: string): Observable<PagedResponse<Book>> {
    const headers = this.getAuthHeaders();

    return this.http.get<PagedResponse<Book>>(`${this.baseUrl}/book/params?year=${year}`, { headers });
  }
}
