import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';

import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-aside',
  imports: [CommonModule, RouterModule],
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.css'], // Виправлено: styleUrls (було styleUrl)
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.5s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class AsideComponent implements OnInit {
  hashTags: string[] = []; // Масив для збереження хештегів
  isLoggedIn: boolean = false; //встановлювати автоматично з сесії
  private authSubscription!: Subscription;
  isLoading: boolean = false; // Статус завантаження
  allHashLoaded: boolean = false; // Ознака, що всі хештеги завантажені
  error: string | null = null;
  //page: number = 0; // Сторінка для пагінації

  constructor(private blogService: BlogService,private userService:UserService) {}

  ngOnInit(): void {
		this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        console.log('User login status:', this.isLoggedIn);
      }
    );
    this.loadHashtags(); // Завантаження хештегів при ініціалізації компонента
  }
	ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  loadHashtags(): void {
    if (this.isLoading || this.allHashLoaded) return; // Якщо завантаження вже йде або всі хештеги завантажено
    this.isLoading = true; // Активуємо статус завантаження
    this.blogService.getPopularTags().subscribe({
      next: (data) => {
        this.hashTags = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Помилка завантаження тегів';
        console.error(err);
        this.isLoading = false;
      },
    });
  }
	
}
