import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private EmailConfirmedSubject = new BehaviorSubject<boolean>(false);
  private authorCount = 4;
  private apiUrl = 'https://localhost:7186/api';

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true); // Якщо токен є, вважаємо, що користувач авторизований
    }
    this.checkEmailConfirmation();
    //перевірити чи this.aboutme.emailConfirmed==true, і якщо так this.EmailConfirmed.next(true);
  }
  public sendEmailConfirmationRequest(
    id: string
  ): Observable<{ message: string }> {
    if (id) {
      const token = this.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
      });

      // Використовуємо параметри заголовків як частину об'єкта налаштувань
      return this.http.post<{ message: string }>(
        `${this.apiUrl}/User/initiate-email-confirmation/${id}`,
        {}, // Пусте тіло запиту
        { headers } // Додаємо заголовки як параметр
      );
    } else {
      return of({ message: '' });
    }
  }
  public confirmEmail(code: string): Observable<string> {
    if (code) {
      const token = this.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
      });

      return this.http
        .post<string>(
          `${this.apiUrl}/User/confirm-email?token=${code}`,
          {}, // Пусте тіло запиту
          { headers, responseType: 'text' as 'json' } // Вказуємо, що очікуємо текст
        )
        .pipe(
          tap(() => {
            this.checkEmailConfirmation(); // Викликаємо метод після успішного запиту
          })
        );
    } else {
      return of(''); // Повертаємо Observable з порожнім рядком
    }
  }

  private checkEmailConfirmation(): void {
    this.aboutme().subscribe({
      next: (user) => {
        console.log('user.emailConfirmed   ', user.emailConfirmed);
        if (user.emailConfirmed) {
          this.EmailConfirmedSubject.next(user.emailConfirmed);
          if (user.emailConfirmed) this.saveEmailConfirmation();
          else {
            this.EmailConfirmedSubject.next(false);
          }

          // Оновлюємо стан підтвердження email
        } else this.EmailConfirmedSubject.next(false);
      },
      error: (err) => {
        console.error('Error fetching user data', err);
      },
    });
  }
  // Метод для отримання стану авторизації
  get isAuthenticated$() {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isEmailConfirmed(): Observable<boolean> {
    return this.EmailConfirmedSubject.asObservable();
  }

  //Отримуємо користувача за ID
  getUserById(id: string): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/User/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching author', error);
        return of(null); // Повертаємо null замість undefined, що може бути зручніше для UI
      })
    );
  }

  // авторизація/реєстрація
  auth(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/Auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          // Зберігаємо токен
          this.saveToken(response.token);
          if (this.isAuthenticated$)
            // Після успішної авторизації викликаємо перевірку підтвердження email
            this.checkEmailConfirmation();
          else console.log('this.isAuthenticated$ is not defined');
          setTimeout(() => {
            if (this.isAuthenticated$) this.checkEmailConfirmation();
          }, 3000);
        })
      );
  }
  aboutme(): Observable<User> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });

    return this.http.get<User>(`${this.apiUrl}/User/aboutme`, { headers });
  }
  saveToken(token: string) {
    localStorage.setItem('authToken', token);
    this.isAuthenticatedSubject.next(true);
  }
  saveEmailConfirmation() {
    localStorage.setItem('emailConfirmation', 'true');
  }
  getToken() {
    return localStorage.getItem('authToken');
  }
  getEmailConfirmation() {
    return localStorage.getItem('emailConfirmation');
  }
  register(email: string, password: string): any {
    const headers = { 'Content-Type': 'application/json' };
    const body = { email, password };

    console.log('Sending data to the server:', body);

    return this.http
      .post(`${this.apiUrl}/Auth/register`, body, {
        headers,
        responseType: 'json',
      })
      .pipe(
        catchError((err) => {
          console.error('Request error:', err);
          const errorMessage =
            err.error?.error || 'Неочікувана помилка на сервері';
          return throwError(() => new Error(errorMessage)); // Повертання помилки
        })
      );
  }
  // Метод для виходу
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('emailConfirmation');
    this.isAuthenticatedSubject.next(false);
    this.EmailConfirmedSubject.next(false);
  }
  forgotPassword(email: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/User/initiate-password-reset`;
    const body = { email: email };

    return this.http.post<any>(url, body).pipe(
      catchError((error) => {
        console.error('Помилка при ініціації скидання паролю:', error);
        return throwError(
          () => new Error('Не вдалося ініціювати скидання паролю')
        );
      })
    );
  }
  resetPassword(
    token: string,
    password: string
  ): Observable<{ message: string }> {
    const url = `${this.apiUrl}/User/reset-password?token=${encodeURIComponent(
      token
    )}`; // API endpoint
    const body = { newPassword: password }; // додаємо пароль в тіло запиту

    return this.http.post<any>(url, body).pipe(
      catchError((error) => {
        console.error('Помилка при скиданні паролю:', error);
        return throwError(
          () => new Error('Не вдалося скинути пароль. Спробуйте пізніше.')
        );
      })
    );
  }

  getPopularAuthors(
    limit: number = this.authorCount,
    start: number = 0
  ): Observable<User[] | undefined> {
    return this.http
      .get<User[]>(
        `${this.apiUrl + '/User/popular-authors'}?start=${start}&limit=${limit}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching popular authors', error);
          return of(undefined); // або повернути пустий масив
        })
      );
  }
  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.apiUrl}/User/${userId}`;
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });

    // Очищаємо порожні поля перед відправкою запиту
    const updatedUserData = this.cleanEmptyFields(userData);

    return this.http.put(url, updatedUserData, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Не вдалося оновити користувача'));
      })
    );
  }
  private cleanEmptyFields(userData: any): any {
    const cleanedData: any = {};
    for (const key in userData) {
      if (userData[key] !== null && userData[key] !== undefined) {
        // Перевіряємо, чи є значення рядком, перед тим, як викликати trim()
        if (typeof userData[key] === 'string' && userData[key].trim() !== '') {
          cleanedData[key] = userData[key];
        } else if (typeof userData[key] !== 'string' && userData[key] !== '') {
          // Додаємо значення, якщо це не порожній рядок
          cleanedData[key] = userData[key];
        }
      }
    }
    return cleanedData;
  }
  deleteUser(userId: string): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    const url = `${this.apiUrl}/User/${userId}`;

    return this.http.delete<void>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Помилка при видаленні користувача:', error);
        return throwError(() => new Error(error));
      })
    );
  }

  //улюблені автори
  toggleFavoriteAuthor(authorId: string): Observable<{ message: string }> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });

    const url = `${this.apiUrl}/User/toggle-favorite-author`;
    const body = { authorId: authorId };
    return this.http.post<{ message: string }>(url, body, { headers }).pipe(
      tap((response) => {
        console.log('Успішно оновлено улюблені автори:', response.message);
      }),
      catchError((error) => {
        console.error('Помилка при оновленні улюблених авторів:', error);
        return throwError(
          () => new Error('Не вдалося оновити улюблені автори')
        );
      })
    );
  }

  getFavoriteAuthors(): Observable<{ message: string; authors: User[] }> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });

    const url = `${this.apiUrl}/User/favorite-authors`; // API endpoint для отримання улюблених авторів

    return this.http
      .get<{ message: string; authors: User[] }>(url, { headers })
      .pipe(
        catchError((error) => {
          console.error('Помилка при отриманні улюблених авторів:', error);
          return throwError(
            () => new Error('Не вдалося отримати улюблених авторів')
          );
        })
      );
  }
}
