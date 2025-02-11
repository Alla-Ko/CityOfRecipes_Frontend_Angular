import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../services/blog.service'; // Імпортуємо сервіс для постів
import { UserService } from '../../services/user.service';
//import { CarouselComponent } from '../carousel/carousel.component';
import { HomeRecipesComponent } from '../home-recipes/home-recipes.component';
import { ProfileComponent } from '../user/user.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileComponent, HomeRecipesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  //posts: Post[] = []; // Масив постів
  page: number = 0; // Поточна сторінка для пагінації
  loading: boolean = false; // Статус завантаження
  allPostsLoaded: boolean = false; // Перевірка, чи всі пости завантажені

  constructor(
    private blogService: BlogService,
    private userService: UserService
  ) {}
  isLoggedIn: boolean = false; //встановлювати автоматично з сесії
  private authSubscription!: Subscription;
  ngOnInit(): void {
    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        console.log('User login status:', this.isLoggedIn);
      }
    );
    window.scrollTo({
      top: 0, // Відступ 20 пікселів зверху
      behavior: 'smooth', // Плавна прокрутка
    });
  }
  ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Обробник події прокручування
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;

    if (scrollPosition >= documentHeight - 100 && !this.allPostsLoaded) {
      // Якщо прокручено донизу і ще є пости для завантаження
      //this.loadPosts(); // Завантажуємо нові пости
    }
  }
}
