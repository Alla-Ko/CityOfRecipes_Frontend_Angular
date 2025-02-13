import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { Category } from '../models/categoria.model';
import { Contest } from '../models/contest.model';
import { Recipe } from '../models/recipe.model';
import { UserService } from '../services/user.service';
@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'https://localhost:7186/api';
  // private posts: Post[] = [];

  private pageSize = 5;
  private hashtagpageSize = 100;

  private currentPage = 0;

  constructor(private http: HttpClient, private userService: UserService) {}
  //отримати рецепти по пагінації з пошуком
  getRecipes(
    page: number,
    pageSize: number,
    searchString: string = ''
  ): Observable<{
    totalCount: number;
    page: Number;
    pageSize: Number;
    recipes: Recipe[];
  }> {
    if (searchString.length > 0)
      return this.http.get<{
        totalCount: number;
        page: Number;
        pageSize: Number;
        recipes: Recipe[];
      }>(
        `${this.apiUrl}/Recipe/searchByString?page=${page}&pageSize=${pageSize}&query=${searchString}`
      );
    else
      return this.http.get<{
        totalCount: number;
        page: Number;
        pageSize: Number;
        recipes: Recipe[];
      }>(`${this.apiUrl}/Recipe?page=${page}&pageSize=${pageSize}`);
  }

  //улюблені рецепти (по токену)
  getFavoriteRecipes(
    page: number,
    pageSize: number
  ): Observable<{
    totalCount: number;
    page: Number;
    pageSize: Number;
    recipes: Recipe[];
  }> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    return this.http.get<{
      totalCount: number;
      page: Number;
      pageSize: Number;
      recipes: Recipe[];
    }>(
      `${this.apiUrl}/Recipe/favorite-recipes?page=${page}&pageSize=${pageSize}`,
      { headers }
    );
  }
  //пошук по категорії
  getRecipesByCategory(
    page: number,
    pageSize: number,
    category: string = ''
  ): Observable<{
    totalCount: number;
    page: Number;
    pageSize: Number;
    recipes: Recipe[];
  }> {
    return this.http.get<{
      totalCount: number;
      page: Number;
      pageSize: Number;
      recipes: Recipe[];
    }>(
      `${this.apiUrl}/Recipe/by-category/${category}?page=${page}&pageSize=${pageSize}`
    );
  }
  //пошук по святу
  getRecipesByHoliday(
    page: number,
    pageSize: number,
    holiday: string = ''
  ): Observable<{
    totalCount: number;
    page: Number;
    pageSize: Number;
    recipes: Recipe[];
  }> {
    return this.http.get<{
      totalCount: number;
      page: Number;
      pageSize: Number;
      recipes: Recipe[];
    }>(
      `${this.apiUrl}/Recipe/holiday?holiday=${holiday}&page=${page}&pageSize=${pageSize}`
    );
  }
  //рецепти по тегу
  getRecipesByTag(
    page: number,
    pageSize: number,
    tag: string
  ): Observable<{
    totalCount: number;
    page: Number;
    pageSize: Number;
    recipes: Recipe[];
  }> {
    return this.http.get<{
      totalCount: number;
      page: Number;
      pageSize: Number;
      recipes: Recipe[];
    }>(
      `${this.apiUrl}/Recipe/searchByTag?page=${page}&pageSize=${pageSize}&tag=${tag}`
    );
  }
  //рецепти по ід автора
  getRecipesByAuthor(
    page: number,
    pageSize: number,
    authorId: string = ''
  ): Observable<{
    totalCount: number;
    page: Number;
    pageSize: Number;
    recipes: Recipe[];
  }> {
    return this.http.get<{
      totalCount: number;
      page: Number;
      pageSize: Number;
      recipes: Recipe[];
    }>(
      `${this.apiUrl}/Recipe/by-author/${authorId}?page=${page}&pageSize=${pageSize}`
    );
  }
  //повернення рецепту по ід
  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/Recipe/${id}`);
  }
  //повернення рецепту по слагу
  getRecipeBySlug(slug: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/Recipe/by-slug/${slug}`);
  }

  //отримання популярних тегів
  getPopularTags(limit: number = this.hashtagpageSize): Observable<string[]> {
    return this.http
      .get<{ tagName: string }[]>(
        `${this.apiUrl + '/Tags/popular'}?limit=${limit}`
      )
      .pipe(map((tags) => tags.map((tag) => tag.tagName)));
  }

  postRecipe(recipe: Recipe): Observable<Recipe> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });

    return this.http.post<Recipe>(`${this.apiUrl}/Recipe`, recipe, { headers });
  }
  //редагування рецепту
  putRecipe(id: string, recipe: Recipe): Observable<{ message: string }> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/Recipe/${id}`,
      recipe,
      {
        headers,
      }
    );
  }
  //видалення рецепту
  deleteRecipe(id: string): Observable<{ message: string }> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/Recipe/${id}`,
      { headers }
    );
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/Category`);
  }

  toggleFavorite(id: string): Observable<{ message: string }> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/Recipe/toggle-favorite-recipe?recipeId=${id}`,
      {}, // Порожній body, якщо не потрібно передавати дані
      { headers } // Заголовки передаються у третьому аргументі
    );
  }
  rateRecipe(
    recipeId: string,
    rating: number
  ): Observable<{ message: string }> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    const rate = {
      recipeId: recipeId,
      rating: rating,
    };
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/Recipe/rate`,
      rate, // Порожній body, якщо не потрібно передавати дані
      { headers } // Заголовки передаються у третьому аргументі
    );
  }

  //----------------------конкурси--------------------------------

  //показати всі конкурси активні
  getActiveContests(): Observable<Contest[]> {
    return this.http.get<Contest[]>(`${this.apiUrl}/Contest/active`);
  }
  //показати завершені конкурси
  getCompletedContests(): Observable<Contest[]> {
    return this.http.get<Contest[]>(`${this.apiUrl}/Contest/finished`);
  }
  //показати конкретний конкурс по ід
  getContestById(id: string): Observable<Contest> {
    return this.http.get<Contest>(`${this.apiUrl}/Contest/${id}`);
  }
  //показати конкретний конкурс по слагу
  getContestBySlug(slug: string): Observable<Contest> {
    return this.http.get<Contest>(`${this.apiUrl}/Contest/by-slug/${slug}`);
  }
  //показати конкурси в яких брав чи бере участь рецепт
  getContestsForParticipatedRecipe(recipeId: string): Observable<Contest[]> {
    return this.http.get<Contest[]>(
      `${this.apiUrl}/Contest/by-recipe/${recipeId}`
    );
  }
  //показати конкурси, в яких рецепт міг би взяти участь
  getContestsForRecipe(recipeId: string): Observable<Contest[]> {
    return this.http.get<Contest[]>(
      `${this.apiUrl}/Contest/available-for-recipe/${recipeId}`
    );
  }
  //додати рецепт на конкурс
  addRecipeToContest(
    contestId: string,
    recipeId: string
  ): Observable<{ message: string }> {
    const token = this.userService.getToken();
    if (!token) {
      return throwError(() => new Error('Користувач не авторизований'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Додаємо токен у заголовок
    });
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/Contest/${contestId}/add-recipe/${recipeId}`,
      {}, // Порожній body, якщо не потрібно передавати дані
      { headers } // Заголовки передаються у третьому аргументі
    );
  }
}
