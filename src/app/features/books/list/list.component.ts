import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Author, Book, BookPayload, PagedResponse } from '../../../core/services/api.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  books: Book[] = [];
  allBooks: Book[] = [];
  authors: Author[] = [];
  errorMessage = '';
  successMessage = '';
  showForm = false;
  editInfoMessage = '';

  title = '';
  gender = '';
  year = '';
  authorId = '';
  searchYear = '';
  searchTitle = '';

  editingBookId: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadAuthors();
    this.loadBooks();
  }

  private extractBooks(response: Book[] | PagedResponse<Book> | null | undefined): Book[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    return [];
  }

  private extractAuthors(response: Author[] | PagedResponse<Author> | null | undefined): Author[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    return [];
  }

  private normalizeYearValue(year: string | number | null | undefined): string {
    return String(year ?? '').trim();
  }

  private isYearValid(year: string | number | null | undefined): boolean {
    return /^\d{4}$/.test(this.normalizeYearValue(year));
  }

  private applyFilters(): void {
    const normalizedSearchYear = this.normalizeYearValue(this.searchYear);
    const normalizedSearchTitle = this.searchTitle.trim().toLowerCase();

    this.books = this.allBooks.filter((book) => {
      const matchesYear = !normalizedSearchYear || String(book.year) === normalizedSearchYear;
      const matchesTitle = !normalizedSearchTitle || String(book.title ?? '').toLowerCase().includes(normalizedSearchTitle);

      return matchesYear && matchesTitle;
    });
  }

  getAuthorLabel(book: Book): string {
    if (typeof book.author === 'string') {
      return book.author;
    }

    return book.author?.name ?? 'Autor nao informado';
  }

  loadBooks(): void {
    this.apiService.getBooks().subscribe({
      next: (response: PagedResponse<Book>) => {
        this.allBooks = this.extractBooks(response);
        this.books = [...this.allBooks];
        console.log('Livros:', response);
      },
      error: (error) => {
        this.errorMessage = 'Nao foi possivel carregar os livros.';
        console.error('Erro ao buscar livros:', error);
      }
    });
  }

  loadAuthors(): void {
    this.apiService.getAuthors().subscribe({
      next: (response: PagedResponse<Author>) => {
        this.authors = this.extractAuthors(response).filter((author) => author.active);
      },
      error: (error) => {
        console.error('Erro ao buscar autores:', error);
      }
    });
  }

  saveBook(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.title.trim() || !this.gender.trim() || !this.normalizeYearValue(this.year) || !this.authorId.trim()) {
      this.errorMessage = 'Preencha todos os campos para cadastrar o livro.';
      return;
    }

    if (!this.isYearValid(this.year)) {
      this.errorMessage = 'Informe um ano valido com 4 numeros.';
      return;
    }

    const body: BookPayload = {
      title: this.title,
      gender: this.gender,
      year: Number(this.normalizeYearValue(this.year)),
      author: {
        id: this.authorId
      }
    };

    this.apiService.saveBook(body).subscribe({
      next: (response) => {
        console.log('Livro salvo com sucesso:', response);
        this.successMessage = 'Livro cadastrado com sucesso.';
        this.clearForm();
        this.showForm = false;
        this.loadBooks();
      },
      error: (error) => {
        this.errorMessage = 'Nao foi possivel salvar o livro. Verifique os dados informados.';
        console.error('Erro ao salvar livro:', error);
      }
    });
  }

  editBook(book: Book): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.editInfoMessage = '';
    this.showForm = true;
    this.editingBookId = book.id;
    this.title = book.title;
    this.gender = book.gender;
    this.year = String(book.year);

    if (typeof book.author === 'object' && book.author?.id) {
      this.authorId = book.author.id;
      return;
    }

    const authorName = typeof book.author === 'string' ? book.author : book.author?.name;
    const matchingAuthor = this.authors.find((author) => author.name === authorName);

    this.authorId = matchingAuthor?.id ?? '';
    this.editInfoMessage = this.authorId
      ? `Autor identificado automaticamente: ${authorName}.`
      : 'Autor mantido como esta. Nao foi possivel identificar o ID automaticamente.';
  }

  updateBook(): void {
    if (!this.editingBookId) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.title.trim() || !this.gender.trim() || !this.normalizeYearValue(this.year)) {
      this.errorMessage = 'Preencha os campos obrigatorios para atualizar o livro.';
      return;
    }

    if (!this.isYearValid(this.year)) {
      this.errorMessage = 'Informe um ano valido com 4 numeros.';
      return;
    }

    const body: BookPayload = {
      title: this.title,
      gender: this.gender,
      year: Number(this.normalizeYearValue(this.year))
    };

    this.apiService.updateBook(this.editingBookId, body).subscribe({
      next: (response) => {
        console.log('Livro atualizado com sucesso:', response);
        this.successMessage = 'Livro atualizado com sucesso.';
        this.clearForm();
        this.showForm = false;
        this.loadBooks();
      },
      error: (error) => {
        this.errorMessage = 'Nao foi possivel atualizar o livro.';
        console.error('Erro ao atualizar livro:', error);
      }
    });
  }

  deleteBook(id: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (isPlatformBrowser(this.platformId) && !window.confirm('Deseja realmente excluir este livro?')) {
      return;
    }

    this.apiService.deleteBook(id).subscribe({
      next: (response) => {
        console.log('Livro deletado com sucesso:', response);
        this.successMessage = 'Livro excluido com sucesso.';
        this.loadBooks();
      },
      error: (error) => {
        this.errorMessage = 'Nao foi possivel excluir o livro.';
        console.error('Erro ao deletar livro:', error);
      }
    });
  }

  clearForm(): void {
    this.title = '';
    this.gender = '';
    this.year = '';
    this.authorId = '';
    this.editingBookId = null;
    this.editInfoMessage = '';
  }

  searchBooks(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.normalizeYearValue(this.searchYear) && !this.searchTitle.trim()) {
      this.books = [...this.allBooks];
      this.successMessage = '';
      return;
    }

    if (this.normalizeYearValue(this.searchYear) && !this.isYearValid(this.searchYear)) {
      this.errorMessage = 'Digite um ano valido para pesquisar.';
      return;
    }

    this.applyFilters();
    this.successMessage = `${this.books.length} livro(s) encontrado(s).`;
  }

  clearSearch(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.searchYear = '';
    this.searchTitle = '';
    this.books = [...this.allBooks];
  }

  toggleForm(): void {
    this.showForm = true;
    this.editingBookId = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.clearForm();
  }

  closeForm(): void {
    this.showForm = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.clearForm();
  }
}
