import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorite-authors',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favorite-authors.component.html',
  styleUrl: './favorite-authors.component.css',
})
export class FavoriteAuthorsComponent {
  favorites: User[] = [];
  isLoggedin: boolean = false; //встановлювати автоматично з сесії
  private authSubscription!: Subscription;
  isLoading: boolean = false; // Індикатор завантаження
  //allAuthorsLoaded: boolean = false;
  start: number = 0; // Початковий індекс
  limit: number = 4; // Кількість авторів для одного запиту
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoading = true; // Завантаження включено
    window.scrollTo(0, 0);
    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedin = isAuthenticated;
        if (this.isLoggedin) {
          this.userService.getFavoriteAuthors().subscribe({
            next: (response) => {
              this.favorites = response.authors; // Записуємо дані в масив
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Помилка при завантаженні авторів:', err);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/login']);
        }
        console.log('User login status:', this.isLoggedin);
      }
    );
  }
  ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
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
  isFavorite(author: User): boolean {
    return this.favorites.some((fav) => fav.id === author.id);
  }
  // Метод для завантаження авторів
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
  // @HostListener('window:scroll', [])
  // onScroll(): void {
  //   if (
  //     window.scrollY > 0 && // Якщо досягнуто кінця сторінки
  //     !this.isLoading
  //   ) {
  //     this.loadAuthors(); // Завантажуємо наступну порцію
  //   }
  // }
}
