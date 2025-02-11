import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Contest } from '../../models/contest.model';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-contests',
  imports: [CommonModule, RouterModule],
  templateUrl: './contests.component.html',
  styleUrl: './contests.component.css',
})
export class ContestsComponent implements OnInit {
  contests: Contest[] = [];
  status: string = '';
  variant: number = 0;
  isLoading: boolean = false; // Індикатор завантаження
  allContestsLoaded: boolean = false; // Індикатор, коли всі рецепти завантажені

  private routeSubscription: Subscription | undefined;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    this.contests = [];
    this.routeSubscription = this.route.data.subscribe({
      next: (userData) => {
        if (userData) {
          let status = userData['status']; // 'active' або 'completed'
          this.status = status;
          console.log('Статус:', status);
          if (status !== 'active' && status !== 'completed') {
            this.router.navigate(['/contests']);
          }
          this.contests = [];
          this.loadContests(this.status);
        }
      },
      error: (error) => {
        console.error('Помилка при отриманні даних:', error);
      },
    });

    this.isLoading = false;
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadContests(status: string): void {
    this.isLoading = true;

    if (status == 'active') {
      this.blogService.getActiveContests().subscribe({
        next: (response) => {
          if (response) {
            this.contests = response; // Додаємо конкурси
          }
          this.isLoading = false; // Завантаження завершено
        },
        error: (err) => {
          console.error('Error loading active contests:', err); // Обробка помилок
          this.isLoading = false; // Завантаження завершено, навіть якщо сталася помилка
        },
      });
    } else if (status == 'completed') {
      // логіка для завершених конкурсів
      this.blogService.getCompletedContests().subscribe({
        next: (response) => {
          if (response) {
            this.contests = response; // Додаємо конкурси
          }
          this.isLoading = false; // Завантаження завершено
        },
        error: (err) => {
          console.error('Error loading completed contests:', err); // Обробка помилок
          this.isLoading = false; // Завантаження завершено, навіть якщо сталася помилка
        },
      });
    } else {
      this.router.navigate(['/recipes']);
    }
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
			
    };
    return date.toLocaleString('uk-UA', options);
  }
}
