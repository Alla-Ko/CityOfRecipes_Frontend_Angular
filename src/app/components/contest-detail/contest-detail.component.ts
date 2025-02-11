import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import DOMPurify from 'dompurify';
import { Subscription } from 'rxjs';
import { Category } from '../../models/categoria.model';
import { Contest } from '../../models/contest.model';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-contest-detail',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './contest-detail.component.html',
  styleUrl: './contest-detail.component.css',
})
export class ContestDetailComponent implements OnInit {
  slug: string = '';
  private routeSubscription: Subscription | undefined;
  contest: Contest = {
    id: '',
    slug: '',
    contestName: '',
    photoUrl: '',
    startDate: '',
    endDate: '',
    requiredIngredients: '',
    categoryId: '',
    contestRecipes: [],
    winningRecipes: [],
    contestDetails: '',
  };
  isCompleted = true;
  sanitizedContestDetails: string = '';
  category: Category = {
    id: '',
    categoryName: 'Категорія рецепта не зазначена',
    slug: '',
  };

  isLoading = true;

  constructor(
    private blogService: BlogService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        const slug = params.get('slug');

        if (slug && slug.trim().length > 0) {
          this.slug = slug;
          this.isLoading = true;
          //this.blogService.getContestById("67a51637da5b0d77d2ad430a").subscribe({
          this.blogService.getContestBySlug(this.slug).subscribe({
            next: (contest) => {
              if (contest) {
                this.contest = contest;
                this.sanitizedContestDetails = DOMPurify.sanitize(
                  this.contest.contestDetails ? this.contest.contestDetails : ''
                );
                var isCompleted = new Date(this.contest.endDate) < new Date();
								console.log("isCompleted:"+isCompleted)
                if (isCompleted||!isCompleted) this.isCompleted = isCompleted;
                this.blogService.getCategories().subscribe({
                  next: (categories) => {
                    if (categories) {
                      const category = categories.find(
                        (c) => c.id === this.contest.categoryId
                      );
                      if (category) {
                        this.category = category;
                      }
                    }
                  },
                  error: (err) => {
                    console.error(err.message);
                  },
                });

                // Отримання авторів для кожного рецепта
                contest.contestRecipes.forEach((recipe) => {
                  this.userService.getUserById(recipe.authorId).subscribe({
                    next: (user) => {
                      if (user) {
                        // Додаємо пробіл між ім'ям та прізвищем
                        recipe.authorName =
                          user.firstName + ' ' + user.lastName;
                        recipe.authorPhotoUrl = user.profilePhotoUrl;
                      }
                    },
                    error: (err) => {
                      console.error(err.message);
                    },
                  });
                });
                if (
                  contest.winningRecipes &&
                  contest.winningRecipes.length > 0
                ) {
                  contest.winningRecipes.forEach((recipe) => {
                    this.userService.getUserById(recipe.authorId).subscribe({
                      next: (user) => {
                        if (user) {
                          // Додаємо пробіл між ��м'ям та прізвищем
                          recipe.authorName =
                            user.firstName + ' ' + user.lastName;
                          recipe.authorPhotoUrl = user.profilePhotoUrl;
                        }
                      },
                      error: (err) => {
                        console.error(err.message);
                      },
                    });
                  });
                  //this.blogService.getContestById("67a51637da5b0d77d2ad430a").subscribe({
                }
              } else {
                console.log('Конкурс по слагу не знайдено: ' + this.slug);
                this.router.navigate(['/contests/active']);
              }
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Помилка завантаження конкурса', err);
              this.isLoading = false;
            },
          });
        } else {
          console.log('Слаг конкурса не передано');
          //this.router.navigate(['/contests/active']);
        }
      },
      error: (error) => {
        console.error('Помилка при отриманні даних:', error);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
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
