import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class ProfileComponent implements OnInit {
  users: User[] = [];
  favorites: User[] = [];
  isLoading: boolean = true;
  isLoadingFavorites: boolean = true;
  isLoggedin: boolean = false; //встановлювати автоматично з сесії
  favoriteButtonText: string = 'Додати в обрані';
  private authSubscription!: Subscription;

  constructor(private userService: UserService) {}

  toggleFavoriteAuthor(user: User): void {
    this.userService.toggleFavoriteAuthor(user.id).subscribe({
      next: (response) => {
        console.log(response.message); // Логування повідомлення

        // Оновлюємо список улюблених авторів після зміни статусу
        this.userService.getFavoriteAuthors().subscribe({
          next: (response) => {
            // Переконуємось, що `response.authors` є масивом
            if (
              !response ||
              !response.authors ||
              !Array.isArray(response.authors)
            ) {
              console.error('Очікував масив, отримав:', response);
              this.favorites = []; // Уникнення помилок
            } else {
              this.favorites = [...response.authors]; // Оновлюємо список фаворитів
            }

            // Оновлюємо статус isfavorited у відповідному user
            user.isfavorited = this.favorites.some((fav) => fav.id === user.id);
          },
          error: (err) => {
            console.error(
              'Помилка при оновленні списку улюблених авторів:',
              err
            );
          },
        });
      },
      error: (err) => {
        console.error('Помилка при зміні статусу фаворита:', err);
      },
    });
  }

  ngOnInit(): void {
    this.isLoadingFavorites = true;

    // Завантаження популярних авторів
    this.userService.getPopularAuthors().subscribe({
      next: (users) => {
        if (users) {
          this.users = users.map((user) => ({ ...user, isfavorited: false })); // Додаємо isfavorited: false

          // Перевіряємо статус авторизації користувача
          this.authSubscription = this.userService.isAuthenticated$.subscribe(
            (isAuthenticated) => {
              this.isLoggedin = isAuthenticated;

              if (this.isLoggedin) {
                // Отримуємо список улюблених авторів
                this.userService.getFavoriteAuthors().subscribe({
                  next: (response) => {
                    if (!response || !Array.isArray(response.authors)) {
                      console.error('Очікував масив, отримав:', response);
                      this.favorites = []; // Уникнення помилок
                    } else {
                      this.favorites = [...response.authors]; // Гарантуємо, що це масив
                    }

                    this.isLoadingFavorites = false;

                    // Оновлюємо isfavorited для відповідних авторів, якщо `this.favorites` масив
                    if (Array.isArray(this.favorites)) {
                      this.favorites.forEach((fav) => {
                        const user = this.users.find((u) => u.id === fav.id);
                        if (user) {
                          user.isfavorited = true;
                        }
                      });
                    } else {
                      console.error(
                        'this.favorites не є масивом:',
                        this.favorites
                      );
                    }
                  },
                  error: (err) => {
                    console.error(
                      'Помилка при завантаженні улюблених авторів:',
                      err
                    );
                  },
                });
              }

              console.log('User login status:', this.isLoggedin);
              this.isLoadingFavorites = false;
            }
          );
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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
}
