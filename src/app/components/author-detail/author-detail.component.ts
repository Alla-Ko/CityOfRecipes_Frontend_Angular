import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import DOMPurify from 'dompurify';
import { Subscription } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-author-detail',
  imports: [RouterModule, CommonModule],
  templateUrl: './author-detail.component.html',
  styleUrl: './author-detail.component.css',
})
export class AuthorDetailComponent implements OnInit {
  authorId: string = '';
  author: User | null = null;
  sanitizedAbout: string = '';
  isLoading = true;
  favorites: User[] = [];
  isLoggedin: boolean = false; //встановлювати автоматично з сесії
  private authSubscription!: Subscription;

  recipes: Recipe[] = [];
  isLoadingRecipes: boolean = false; // Індикатор завантаження
  isStartLoading: boolean = true;
  allRecipesLoaded: boolean = false; // Індикатор, коли всі рецепти завантажені
  start: number = 1; // Початковий індекс
  limit: number = 2; // Кількість рецептів для одного запиту

  constructor(
    private blogService: BlogService,

    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  toggleFavoriteAuthor(user: User): void {
    this.userService.toggleFavoriteAuthor(user.id).subscribe({
      next: (response) => {
        console.log(response.message); // Логування повідомлення
        this.userService.getFavoriteAuthors().subscribe({
          next: (response) => {
            this.favorites = response.authors; // Оновлюємо список фаворитів
          },
          error: (err) => {
            console.error('Помилка при зміні статусу фаворита:', err);
          },
        });
      },
      error: (err) => {
        console.error('Помилка при зміні статусу фаворита:', err);
      },
    });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Отримуємо параметр ID з URL
    const id: any = this.route.snapshot.paramMap.get('id');
    if (id) this.authorId = id;
    // Тепер можна використовувати authorId для отримання даних автора
    if (this.authorId) {
      this.userService.getUserById(this.authorId).subscribe({
        next: (userData) => {
          if (userData) {
            this.author = userData; // Зберігаємо отримані дані в author
            this.sanitizedAbout = DOMPurify.sanitize(
              this.author.about ? this.author.about : ''
            );
            this.isLoading = false; // Завершуємо індикацію завантаження

            //завантаження рецептів цього автора
            this.start = 1;
            this.recipes = [];
            this.allRecipesLoaded = false;
            this.loadRecipes();
          } else {
            this.router.navigate(['/authors']);
          }
        },
        error: (err) => {
          console.error('Помилка завантаження даних користувача', err);
          this.isLoading = false; // Завершуємо завантаження при помилці
          this.router.navigate(['/authors']);
        },
      });
    }
    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedin = isAuthenticated;
        if (this.isLoggedin) {
          this.userService.getFavoriteAuthors().subscribe({
            next: (response) => {
              this.favorites = response.authors; // Записуємо дані в масив
            },
            error: (err) => {
              console.error('Помилка завантаження списку фаворитів:', err);
            },
          });
        }
        console.log('User login status:', this.isLoggedin);
      }
    );
    this.isStartLoading = false;
  }
  ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadRecipes(): void {
    if (this.isLoading || this.allRecipesLoaded) return;

    this.isLoading = true;
    this.blogService
      .getRecipesByAuthor(this.start, this.limit, this.authorId)
      .subscribe({
        next: ({ totalCount, recipes }) => {
          if (recipes && recipes.length > 0) {
            this.recipes.push(...recipes); // Додаємо нові рецепти
            this.start++; // Зсуваємо початковий індекс
            console.log('КК рецептів в масиві=' + this.recipes.length);
          } else if (this.start === 1) {
            // Якщо це перший запит і результатів немає
            this.allRecipesLoaded = true; // Не буде більше рецептів
            this.recipes = [];
          } else {
            this.allRecipesLoaded = true; // Якщо це не перший запит і більше немає результатів
          }

          this.isLoading = false; // Завантаження завершено
        },
        error: (err) => {
          console.error('Error loading recipes:', err); // Обробка помилок
          this.isLoading = false; // Завантаження завершено, навіть якщо сталася помилка
        },
      });
  }

  getRatingStars(rating: number): {
    full: number;
    half: number;
    empty: number;
  } {
    const fullStars = Math.floor(rating); // Кількість повних зірочок
    const halfStar = fullStars < rating ? 1 : 0; // Половинна зірочка (якщо є)
    const emptyStars = 5 - fullStars - halfStar; // Порожні зірочки

    return { full: fullStars, half: halfStar, empty: emptyStars };
  }

  calculateResidenceDuration(registrationDate: string): string {
    const now = new Date();
    const registrationDateObj = new Date(registrationDate);

    let years = now.getFullYear() - registrationDateObj.getFullYear();
    let months = now.getMonth() - registrationDateObj.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} р і ${months} міс`;
  }
  // Метод для обробки прокрутки сторінки вниз
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (
      window.scrollY > 0 && // Якщо досягнуто кінця сторінки
      !this.isLoading
    ) {
      this.loadRecipes(); // Завантажуємо наступну порцію
    }
  }

  isFavorite(author: User): boolean {
    return this.favorites.some((fav) => fav.id === author.id);
  }
}
