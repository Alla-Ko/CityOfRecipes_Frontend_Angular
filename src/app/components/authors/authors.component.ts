import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-authors',
  imports: [CommonModule, RouterModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.css',
})
export class AuthorsComponent implements OnInit {
  users: User[] = [];
  favorites: User[] = [];
  isLoggedin: boolean = false; //встановлювати автоматично з сесії
  private authSubscription!: Subscription;
  isLoading: boolean = false; // Індикатор завантаження
  isStartLoading: boolean = true;
  allAuthorsLoaded: boolean = false; // Індикатор, коли всі автори завантажені
  start: number = 0; // Початковий індекс
  limit: number = 4; // Кількість авторів для одного запиту

  constructor(private userService: UserService) {}
  toggleFavoriteAuthor(user: User): void {
    this.userService.toggleFavoriteAuthor(user.id).subscribe({
      next: (response) => {
        console.log(response.message); // Логування повідомлення
        this.userService.getFavoriteAuthors().subscribe({
          next: (response) => {
            this.favorites = response.authors; // Оновлюємо список фаворитів
          },
          error: (err) => {
            console.error('Помилка при завантаженні авторів:', err);
          },
        });
      },
      error: (err) => {
        console.error('Помилка при зміні статусу фаворита:', err);
      },
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedin = isAuthenticated;

        if (this.isLoggedin) {
          this.userService.getFavoriteAuthors().subscribe({
            next: (response) => {
              this.favorites = response.authors; // Записуємо дані в масив
            },
            error: (err) => {
              console.error('Помилка при завантаженні авторів:', err);
            },
          });
        }
        this.isStartLoading = false;
        console.log('User login status:', this.isLoggedin);
      }
    );
    this.loadAuthors(); // Завантаження перших авторів
  }
  ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  isFavorite(author: User): boolean {
    return this.favorites.some((fav) => fav.id === author.id);
  }
  // Метод для завантаження авторів
  private loadAuthors(): void {
    if (this.isLoading || this.allAuthorsLoaded) return;

    this.isLoading = true;
    this.userService.getPopularAuthors(this.limit, this.start).subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          this.users.push(...users); // Додаємо нових авторів
          this.start += this.limit; // Зсуваємо початковий індекс
        } else {
          this.allAuthorsLoaded = true; // Якщо нових авторів немає, завершуємо
        }
        this.isLoading = false; // Завантаження завершено
      },
      error: (err) => {
        console.error('Error loading users:', err); // Обробка помилок
        this.isLoading = false; // Завантаження завершено, навіть якщо сталася помилка
      },
    });
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
  // Метод для обробки прокрутки сторінки вниз
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (
      window.scrollY > 0 && // Якщо досягнуто кінця сторінки
      !this.isLoading
    ) {
      this.loadAuthors(); // Завантажуємо наступну порцію
    }
  }
}
