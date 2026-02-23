# 📚 API Guide — Lusiana LibraryWeb

> **Versi**: 1.0.0  
> **Base URL**: Dikonfigurasi via environment variable `VITE_API_BASE_URL`  
> **Auth**: Bearer Token (JWT) via header `Authorization: Bearer <token>`

Dokumen ini berisi **seluruh endpoint API** yang digunakan dalam codebase, lengkap dengan konfigurasi, tipe data, request/response shape, serta contoh implementasi siap copy ke proyek lain.

---

## Daftar Isi

1. [Setup & Konfigurasi Axios](#1-setup--konfigurasi-axios)
2. [Tipe Data (TypeScript Interfaces)](#2-tipe-data-typescript-interfaces)
3. [Response Envelope](#3-response-envelope)
4. [Authentication](#4-authentication)
5. [Books](#5-books)
6. [Authors](#6-authors)
7. [Categories](#7-categories)
8. [Reviews](#8-reviews)
9. [Cart](#9-cart)
10. [Loans (Peminjaman)](#10-loans-peminjaman)
11. [Profile / Me](#11-profile--me)
12. [Admin](#12-admin)
13. [Error Handling](#13-error-handling)
14. [Ringkasan Endpoint](#14-ringkasan-endpoint)

---

## 1. Setup & Konfigurasi Axios

### Environment Variable

```env
# .env
VITE_API_BASE_URL=https://your-api-domain.com
```

### Axios Instance

```typescript
// src/lib/axios.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor — Auto-attach Token

Token disimpan di `localStorage` dengan key `token`. Interceptor secara otomatis menyisipkan header `Authorization` di setiap request.

```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor — Handle 401 & Sanitize Blob URLs

```typescript
// Sanitize blob:// URLs dari response agar fallback UI berjalan
const sanitizeBlobUrls = (data: any) => {
  if (!data || typeof data !== 'object') return;
  if (Array.isArray(data)) {
    data.forEach(sanitizeBlobUrls);
  } else {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (typeof value === 'string' && value.startsWith('blob:')) {
        data[key] = '';
      } else if (typeof value === 'object') {
        sanitizeBlobUrls(value);
      }
    });
  }
};

api.interceptors.response.use(
  (response) => {
    if (response.data) sanitizeBlobUrls(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Tipe Data (TypeScript Interfaces)

Semua interface di bawah ini berada di `src/types/index.ts`.

### User

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  profilePhoto?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}
```

### Book

```typescript
interface Book {
  id: number;
  title: string;
  description: string | null;
  isbn: string;
  publishedYear: number | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  pages?: number;
  author?: Author;
  category?: Category;
  reviews?: Review[];
}
```

### Author

```typescript
interface Author {
  id: number;
  name: string;
  bio?: string | null;
  profilePhoto?: string | null;
  bookCount?: number;
  accumulatedScore?: number;
}
```

### Category

```typescript
interface Category {
  id: number;
  name: string;
}
```

### Review

```typescript
interface Review {
  id: number;
  bookId: number;
  userId: number;
  star: number;
  comment?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: Pick<User, 'id' | 'name' | 'profilePhoto'>;
  book?: Pick<Book, 'id' | 'title' | 'coverImage' | 'author'>;
}
```

### Loan

```typescript
interface Loan {
  id: number;
  bookId: number;
  userId: number;
  status: 'BORROWED' | 'LATE' | 'RETURNED';
  displayStatus?: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  durationDays?: number;
  book?: Book;
  borrower?: User;
}
```

### Cart

```typescript
interface CartItem {
  id: number;
  bookId: number;
  book?: Book;
}

interface Cart {
  cartId: number;
  items: CartItem[];
  itemCount: number;
}
```

### Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### Filter Params

```typescript
interface BookFilters {
  q?: string;
  categoryId?: number;
  authorId?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

interface LoanFilters {
  status?: 'all' | 'active' | 'returned' | 'overdue';
  q?: string;
  page?: number;
  limit?: number;
}
```

### Admin — Book Input

```typescript
type BookInput = Omit<
  Book,
  | 'id' | 'createdAt' | 'updatedAt' | 'author' | 'category'
  | 'reviews' | 'availableCopies' | 'borrowCount' | 'reviewCount'
  | 'rating' | 'authorId'
> & {
  authorName: string;
  description: string;
  coverImage: string;
  publishedYear: number;
};
```

### Auth Request/Response

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}
```

---

## 3. Response Envelope

Backend menggunakan envelope standar untuk **semua** response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

| Field     | Tipe      | Keterangan                         |
|-----------|-----------|------------------------------------|
| `success` | `boolean` | Apakah request berhasil            |
| `message` | `string`  | Pesan deskriptif dari server       |
| `data`    | `any`     | Payload utama (bervariasi per endpoint) |

> **Pattern untuk parsing**: Response selalu diambil dari `response.data.data` (axios wraps `response.data`, lalu backend wraps di `data`). Kode defensif digunakan karena ada variasi shape:

```typescript
// Parsing array
const payload = response.data?.data;
if (Array.isArray(payload)) return payload;
if (Array.isArray(payload?.items)) return payload.items; // fallback nama key bervariasi
return [];

// Parsing paginated
const payload = response.data?.data;
return {
  items: Array.isArray(payload?.books) ? payload.books : [],
  totalPages: payload?.pagination?.totalPages ?? 1,
};
```

---

## 4. Authentication

### `POST /api/auth/login`

Login user dan dapatkan JWT token.

| Aspek        | Detail                                   |
|--------------|------------------------------------------|
| **Auth**     | ❌ Tidak perlu token                      |
| **Body**     | `{ email: string, password: string }`    |
| **Response** | `{ data: { token: string, user: User } }` |

```typescript
const response = await api.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});
const payload = response.data?.data ?? response.data;
// payload.token → JWT string
// payload.user  → User object
```

**Setelah login**, simpan token dan user ke `localStorage`:
```typescript
localStorage.setItem('token', payload.token);
localStorage.setItem('user', JSON.stringify(payload.user));
```

---

### `POST /api/auth/register`

Registrasi user baru.

| Aspek        | Detail                                                    |
|--------------|-----------------------------------------------------------|
| **Auth**     | ❌ Tidak perlu token                                       |
| **Body**     | `{ name: string, email: string, password: string, phone?: string }` |
| **Response** | `{ success: true, message: "..." }`                        |

```typescript
await api.post('/api/auth/register', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword',
  phone: '081234567890',
});
```

---

### Logout (Client-side Only)

Logout dilakukan di sisi client, tidak ada endpoint backend.

```typescript
localStorage.removeItem('token');
localStorage.removeItem('user');
// redirect ke /login
```

---

## 5. Books

### `GET /api/books`

Ambil daftar buku dengan filter & pagination.

| Aspek          | Detail                                          |
|----------------|--------------------------------------------------|
| **Auth**       | ❌ (Public)                                       |
| **Query Params** | `q`, `categoryId`, `authorId`, `minRating`, `page`, `limit` |
| **Response**   | `{ data: { books: Book[], pagination: { totalPages } } }` |

```typescript
const { data } = await api.get('/api/books', {
  params: { q: 'harry', categoryId: 2, page: 1, limit: 10 },
});
const books = data?.data?.books ?? [];
const totalPages = data?.data?.pagination?.totalPages ?? 1;
```

---

### `GET /api/books/recommend`

Ambil buku rekomendasi (digunakan di homepage saat tidak ada search/filter).

| Aspek          | Detail                                          |
|----------------|--------------------------------------------------|
| **Auth**       | ❌ (Public)                                       |
| **Query Params** | `page`, `limit`                                |
| **Response**   | Sama dengan `GET /api/books`                     |

```typescript
const { data } = await api.get('/api/books/recommend', {
  params: { page: 1, limit: 10 },
});
```

---

### `GET /api/books/:id`

Ambil detail satu buku.

| Aspek      | Detail                        |
|------------|-------------------------------|
| **Auth**   | ❌ (Public)                    |
| **Params** | `id` — Book ID               |
| **Response** | `{ data: Book }` (termasuk `author`, `category`, `reviews`) |

```typescript
const { data } = await api.get(`/api/books/${bookId}`);
const book: Book = data?.data;
```

---

### `POST /api/books`

Tambah buku baru (Admin).

| Aspek    | Detail                |
|----------|-----------------------|
| **Auth** | ✅ Bearer Token (ADMIN) |
| **Body** | `BookInput`           |
| **Response** | `{ data: Book }`  |

```typescript
await api.post('/api/books', {
  title: 'New Book',
  isbn: '978-3-16-148410-0',
  categoryId: 1,
  authorName: 'Author Name',
  description: 'Book description',
  coverImage: 'https://...',
  publishedYear: 2024,
  totalCopies: 5,
});
```

---

### `PUT /api/books/:id`

Update buku (Admin).

| Aspek    | Detail                  |
|----------|-------------------------|
| **Auth** | ✅ Bearer Token (ADMIN)   |
| **Body** | `BookInput`             |

```typescript
await api.put(`/api/books/${id}`, updatedBookData);
```

---

### `DELETE /api/books/:id`

Hapus buku (Admin).

| Aspek    | Detail                  |
|----------|-------------------------|
| **Auth** | ✅ Bearer Token (ADMIN)   |
| **Params** | `id` — Book ID        |

```typescript
await api.delete(`/api/books/${id}`);
```

---

## 6. Authors

### `GET /api/authors`

Ambil semua author.

| Aspek      | Detail                            |
|------------|-----------------------------------|
| **Auth**   | ❌ (Public)                        |
| **Response** | `{ data: Author[] }` atau `{ data: { authors: Author[] } }` |

```typescript
const { data } = await api.get('/api/authors');
const payload = data?.data;
const authors = Array.isArray(payload) ? payload : payload?.authors ?? [];
```

---

### `GET /api/authors/popular`

Ambil daftar author populer.

| Aspek      | Detail                            |
|------------|-----------------------------------|
| **Auth**   | ❌ (Public)                        |
| **Response** | `{ data: Author[] }` atau `{ data: { authors: Author[] } }` |

```typescript
const { data } = await api.get('/api/authors/popular');
const authors = Array.isArray(data?.data) ? data.data : data?.data?.authors ?? [];
```

---

### `GET /api/authors/:id/books`

Ambil profil author beserta buku-bukunya.

| Aspek      | Detail                                       |
|------------|----------------------------------------------|
| **Auth**   | ❌ (Public)                                    |
| **Params** | `id` — Author ID                             |
| **Response** | `{ data: { author: Author, books: Book[] } }` |

```typescript
const { data } = await api.get(`/api/authors/${authorId}/books`);
const { author, books } = data?.data;
```

---

### `POST /api/authors`

Tambah author baru (Admin).

| Aspek    | Detail                             |
|----------|-------------------------------------|
| **Auth** | ✅ Bearer Token (ADMIN)               |
| **Body** | `{ name: string, bio?: string, profilePhoto?: string }` |

```typescript
await api.post('/api/authors', { name: 'New Author', bio: 'Bio text' });
```

---

### `PUT /api/authors/:id`

Update author (Admin).

| Aspek    | Detail                             |
|----------|-------------------------------------|
| **Auth** | ✅ Bearer Token (ADMIN)               |
| **Body** | `Partial<Author>`                   |

```typescript
await api.put(`/api/authors/${id}`, { name: 'Updated Name', bio: 'New bio' });
```

---

### `DELETE /api/authors/:id`

Hapus author (Admin).

| Aspek    | Detail                |
|----------|-----------------------|
| **Auth** | ✅ Bearer Token (ADMIN) |

```typescript
await api.delete(`/api/authors/${id}`);
```

---

## 7. Categories

### `GET /api/categories`

Ambil semua kategori buku.

| Aspek      | Detail                            |
|------------|-----------------------------------|
| **Auth**   | ❌ (Public)                        |
| **Response** | `{ data: Category[] }` atau `{ data: { categories: Category[] } }` |

```typescript
const { data } = await api.get('/api/categories');
const payload = data?.data;
const categories = Array.isArray(payload) ? payload : payload?.categories ?? [];
```

---

### `POST /api/categories`

Tambah kategori baru (Admin).

| Aspek    | Detail                |
|----------|-----------------------|
| **Auth** | ✅ Bearer Token (ADMIN) |
| **Body** | `{ name: string }`    |

```typescript
await api.post('/api/categories', { name: 'Science Fiction' });
```

---

### `PUT /api/categories/:id`

Update nama kategori (Admin).

| Aspek    | Detail                |
|----------|-----------------------|
| **Auth** | ✅ Bearer Token (ADMIN) |
| **Body** | `{ name: string }`    |

```typescript
await api.put(`/api/categories/${id}`, { name: 'Updated Category' });
```

---

### `DELETE /api/categories/:id`

Hapus kategori (Admin). Akan gagal jika masih ada buku di kategori tersebut.

| Aspek    | Detail                |
|----------|-----------------------|
| **Auth** | ✅ Bearer Token (ADMIN) |

```typescript
await api.delete(`/api/categories/${id}`);
```

---

## 8. Reviews

### `GET /api/reviews/book/:bookId`

Ambil semua review untuk buku tertentu.

| Aspek      | Detail                            |
|------------|-----------------------------------|
| **Auth**   | ❌ (Public)                        |
| **Params** | `bookId` — Book ID               |
| **Response** | `{ data: { bookId, reviews: Review[], pagination } }` atau `{ data: Review[] }` |

```typescript
const { data } = await api.get(`/api/reviews/book/${bookId}`);
const payload = data?.data;
const reviews = Array.isArray(payload) ? payload : payload?.reviews ?? [];
```

---

### `POST /api/reviews`

Tambah review untuk buku.

| Aspek    | Detail                                                |
|----------|--------------------------------------------------------|
| **Auth** | ✅ Bearer Token                                         |
| **Body** | `{ bookId: number, star: number, comment?: string }`  |

```typescript
await api.post('/api/reviews', {
  bookId: 1,
  star: 5,
  comment: 'Buku yang sangat bagus!',
});
```

---

## 9. Cart

### `GET /api/cart`

Ambil isi keranjang user.

| Aspek      | Detail                                        |
|------------|------------------------------------------------|
| **Auth**   | ✅ Bearer Token                                 |
| **Response** | `{ data: { cartId: number, items: CartItem[], itemCount: number } }` |

```typescript
const { data } = await api.get('/api/cart');
const cart: Cart = data?.data ?? { cartId: 0, items: [], itemCount: 0 };
```

---

### `POST /api/cart/items`

Tambah buku ke keranjang.

| Aspek    | Detail                  |
|----------|-------------------------|
| **Auth** | ✅ Bearer Token           |
| **Body** | `{ bookId: number }`    |

```typescript
await api.post('/api/cart/items', { bookId: 1 });
```

---

### `DELETE /api/cart/items/:itemId`

Hapus satu item dari keranjang.

| Aspek    | Detail                  |
|----------|-------------------------|
| **Auth** | ✅ Bearer Token           |
| **Params** | `itemId` — Cart Item ID |

```typescript
await api.delete(`/api/cart/items/${itemId}`);
```

---

### `DELETE /api/cart`

Kosongkan seluruh keranjang.

| Aspek    | Detail            |
|----------|-------------------|
| **Auth** | ✅ Bearer Token     |

```typescript
await api.delete('/api/cart');
```

---

## 10. Loans (Peminjaman)

### `POST /api/loans`

Pinjam satu buku secara langsung (tanpa cart).

| Aspek    | Detail                  |
|----------|-------------------------|
| **Auth** | ✅ Bearer Token           |
| **Body** | `{ bookId: number }`    |

```typescript
await api.post('/api/loans', { bookId: 1 });
```

---

### `POST /api/loans/from-cart`

Checkout — pinjam buku dari keranjang. Ini adalah flow utama peminjaman.

| Aspek    | Detail                                                         |
|----------|----------------------------------------------------------------|
| **Auth** | ✅ Bearer Token                                                  |
| **Body** | `{ itemIds: number[], borrowDate: string, borrowDuration: 3 \| 5 \| 10 }` |

- `itemIds` — Array ID dari cart items yang dipilih
- `borrowDate` — Format `YYYY-MM-DD`
- `borrowDuration` — Durasi pinjam dalam hari (pilihan: `3`, `5`, atau `10`)

```typescript
await api.post('/api/loans/from-cart', {
  itemIds: [1, 2, 3],
  borrowDate: '2024-03-15',
  borrowDuration: 5,
});
```

---

### `GET /api/loans/my`

Ambil daftar peminjaman user sendiri.

| Aspek          | Detail                                          |
|----------------|--------------------------------------------------|
| **Auth**       | ✅ Bearer Token                                    |
| **Query Params** | `status` (`all`/`active`/`returned`/`overdue`), `q`, `page`, `limit` |
| **Response**   | `{ data: { loans: Loan[], pagination } }` atau `{ data: Loan[] }` |

```typescript
const { data } = await api.get('/api/loans/my', {
  params: { status: 'active', page: 1, limit: 10 },
});
const payload = data?.data;
const loans = Array.isArray(payload) ? payload : payload?.loans ?? [];
```

---

### `PATCH /api/loans/:loanId/return`

User mengembalikan buku yang dipinjam.

| Aspek    | Detail                |
|----------|-----------------------|
| **Auth** | ✅ Bearer Token         |
| **Params** | `loanId` — Loan ID  |

```typescript
await api.patch(`/api/loans/${loanId}/return`);
```

---

## 11. Profile / Me

### `GET /api/me`

Ambil profil, statistik peminjaman, dan jumlah review user yang sedang login.

| Aspek      | Detail                                        |
|------------|------------------------------------------------|
| **Auth**   | ✅ Bearer Token                                 |
| **Response** | `{ data: { profile: User, loanStats: LoanStats, reviewsCount: number } }` |

**LoanStats shape:**
```json
{
  "borrowed": 3,
  "late": 1,
  "returned": 10,
  "total": 14
}
```

```typescript
const { data } = await api.get('/api/me');
const profile = data?.data?.profile;        // User object
const loanStats = data?.data?.loanStats;     // { borrowed, late, returned, total }
const reviewsCount = data?.data?.reviewsCount; // number
```

---

### `PATCH /api/me`

Update profil user yang sedang login.

| Aspek    | Detail                                                |
|----------|--------------------------------------------------------|
| **Auth** | ✅ Bearer Token                                         |
| **Body** | `{ name?: string, phone?: string, profilePhoto?: string }` |

```typescript
await api.patch('/api/me', {
  name: 'Updated Name',
  phone: '081234567890',
  profilePhoto: 'https://...',
});
```

---

### `GET /api/me/reviews`

Ambil semua review yang ditulis oleh user yang sedang login.

| Aspek      | Detail                            |
|------------|-----------------------------------|
| **Auth**   | ✅ Bearer Token                     |
| **Response** | `{ data: { reviews: Review[], pagination } }` atau `{ data: Review[] }` |

```typescript
const { data } = await api.get('/api/me/reviews');
const payload = data?.data;
const reviews = Array.isArray(payload) ? payload : payload?.reviews ?? [];
```

---

## 12. Admin

> Semua endpoint admin membutuhkan token dengan role `ADMIN`.

### `GET /api/admin/overview`

Ambil ringkasan statistik dashboard admin.

| Aspek      | Detail                                        |
|------------|------------------------------------------------|
| **Auth**   | ✅ Bearer Token (ADMIN)                          |
| **Response** | `{ data: { totalBooks, totalLoans, totalUsers, overdueLoans, ... } }` |

```typescript
const { data } = await api.get('/api/admin/overview');
const overview = data?.data;
// overview.totalBooks, overview.totalLoans, overview.totalUsers, overview.overdueLoans
```

---

### `GET /api/admin/users`

Ambil daftar semua user (paginated).

| Aspek          | Detail                            |
|----------------|-----------------------------------|
| **Auth**       | ✅ Bearer Token (ADMIN)              |
| **Query Params** | `q`, `page`, `limit`             |
| **Response**   | `{ data: { users: User[], pagination: { totalPages } } }` |

```typescript
const { data } = await api.get('/api/admin/users', {
  params: { q: 'john', page: 1, limit: 20 },
});
const users = data?.data?.users ?? [];
const totalPages = data?.data?.pagination?.totalPages ?? 1;
```

---

### `GET /api/admin/loans`

Ambil semua peminjaman (paginated, untuk admin).

| Aspek          | Detail                            |
|----------------|-----------------------------------|
| **Auth**       | ✅ Bearer Token (ADMIN)              |
| **Query Params** | `status`, `q`, `page`, `limit`   |
| **Response**   | `{ data: { loans: Loan[], pagination: { totalPages } } }` |

```typescript
const { data } = await api.get('/api/admin/loans', {
  params: { status: 'active', page: 1, limit: 15 },
});
const loans = data?.data?.loans ?? [];
```

---

### `PATCH /api/admin/loans/:loanId`

Admin mengubah status peminjaman (mis. tandai sebagai RETURNED).

| Aspek    | Detail                          |
|----------|---------------------------------|
| **Auth** | ✅ Bearer Token (ADMIN)            |
| **Body** | `{ status: 'RETURNED' }`        |

```typescript
await api.patch(`/api/admin/loans/${loanId}`, { status: 'RETURNED' });
```

---

## 13. Error Handling

### Response Error Shape

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Pattern untuk Error Handling (dari AxiosError)

```typescript
import type { AxiosError } from 'axios';

try {
  await api.post('/api/some-endpoint', body);
} catch (error) {
  const axiosError = error as AxiosError<{ message?: string }>;
  const errorMessage = axiosError.response?.data?.message || 'Terjadi kesalahan';
  console.error('API Error:', errorMessage);
}
```

### Global 401 Handling

Sudah di-handle oleh response interceptor — otomatis hapus token, user, dan redirect ke `/login`.

---

## 14. Ringkasan Endpoint

| # | Method   | Endpoint                    | Auth     | Deskripsi                           |
|---|----------|-----------------------------|----------|--------------------------------------|
| 1 | `POST`   | `/api/auth/login`           | ❌       | Login user                           |
| 2 | `POST`   | `/api/auth/register`        | ❌       | Register user baru                   |
| 3 | `GET`    | `/api/books`                | ❌       | Daftar buku (filter + pagination)    |
| 4 | `GET`    | `/api/books/recommend`      | ❌       | Buku rekomendasi                     |
| 5 | `GET`    | `/api/books/:id`            | ❌       | Detail buku                          |
| 6 | `POST`   | `/api/books`                | ✅ ADMIN | Tambah buku                          |
| 7 | `PUT`    | `/api/books/:id`            | ✅ ADMIN | Update buku                          |
| 8 | `DELETE` | `/api/books/:id`            | ✅ ADMIN | Hapus buku                           |
| 9 | `GET`    | `/api/authors`              | ❌       | Semua author                         |
| 10| `GET`    | `/api/authors/popular`      | ❌       | Author populer                       |
| 11| `GET`    | `/api/authors/:id/books`    | ❌       | Author + buku-bukunya                |
| 12| `POST`   | `/api/authors`              | ✅ ADMIN | Tambah author                        |
| 13| `PUT`    | `/api/authors/:id`          | ✅ ADMIN | Update author                        |
| 14| `DELETE` | `/api/authors/:id`          | ✅ ADMIN | Hapus author                         |
| 15| `GET`    | `/api/categories`           | ❌       | Semua kategori                       |
| 16| `POST`   | `/api/categories`           | ✅ ADMIN | Tambah kategori                      |
| 17| `PUT`    | `/api/categories/:id`       | ✅ ADMIN | Update kategori                      |
| 18| `DELETE` | `/api/categories/:id`       | ✅ ADMIN | Hapus kategori                       |
| 19| `GET`    | `/api/reviews/book/:bookId` | ❌       | Review per buku                      |
| 20| `POST`   | `/api/reviews`              | ✅ USER  | Tambah review                        |
| 21| `GET`    | `/api/cart`                 | ✅ USER  | Isi keranjang                        |
| 22| `POST`   | `/api/cart/items`           | ✅ USER  | Tambah ke keranjang                  |
| 23| `DELETE` | `/api/cart/items/:itemId`   | ✅ USER  | Hapus item dari keranjang            |
| 24| `DELETE` | `/api/cart`                 | ✅ USER  | Kosongkan keranjang                  |
| 25| `POST`   | `/api/loans`               | ✅ USER  | Pinjam buku langsung                 |
| 26| `POST`   | `/api/loans/from-cart`     | ✅ USER  | Checkout dari keranjang              |
| 27| `GET`    | `/api/loans/my`            | ✅ USER  | Peminjaman user sendiri              |
| 28| `PATCH`  | `/api/loans/:id/return`    | ✅ USER  | Kembalikan buku                      |
| 29| `GET`    | `/api/me`                  | ✅ USER  | Profil + statistik user              |
| 30| `PATCH`  | `/api/me`                  | ✅ USER  | Update profil                        |
| 31| `GET`    | `/api/me/reviews`          | ✅ USER  | Review yang ditulis user             |
| 32| `GET`    | `/api/admin/overview`      | ✅ ADMIN | Dashboard statistik                  |
| 33| `GET`    | `/api/admin/users`         | ✅ ADMIN | Daftar semua user                    |
| 34| `GET`    | `/api/admin/loans`         | ✅ ADMIN | Daftar semua peminjaman              |
| 35| `PATCH`  | `/api/admin/loans/:id`     | ✅ ADMIN | Update status peminjaman             |

---

## Cara Duplikasi ke Proyek Lain

### Langkah Minimum

1. **Copy `src/lib/axios.ts`** — konfigurasi axios + interceptors
2. **Copy `src/types/index.ts`** — semua TypeScript interfaces
3. **Set `.env`** — atur `VITE_API_BASE_URL` ke URL backend target
4. **Install dependencies**:
   ```bash
   npm install axios @tanstack/react-query
   ```
5. **Copy hooks yang dibutuhkan** dari `src/hooks/`:
   - `useAuth.ts` — login, register, logout
   - `useBookDetail.ts` — book detail, reviews, borrow
   - `useBooksAdmin.ts` — CRUD book (admin)
   - `useAuthorsAdmin.ts` — CRUD author (admin)
   - `useCart.ts` — cart operations
   - `useMyLoans.ts` — user loans
   - `useProfile.ts` — profile & user reviews
6. **Setup `QueryClientProvider`** di root app:
   ```tsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   const queryClient = new QueryClient();

   function App() {
     return (
       <QueryClientProvider client={queryClient}>
         {/* your app */}
       </QueryClientProvider>
     );
   }
   ```
7. **Setup auth state** — copy `src/store/authSlice.ts` (Redux Toolkit) atau buat versi Zustand/Context sendiri

### Catatan Penting

- Semua endpoint menggunakan prefix `/api/` — pastikan backend menggunakan prefix yang sama
- Token disimpan di `localStorage` dengan key `token`
- Response interceptor otomatis redirect ke `/login` pada 401
- Backend mungkin mengembalikan data dalam format array langsung ATAU nested object — selalu gunakan parsing defensif
