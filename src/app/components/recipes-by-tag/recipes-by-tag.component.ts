import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-recipes-by-tag',
  imports: [CommonModule, RouterModule],
  templateUrl: './recipes-by-tag.component.html',
  styleUrl: './recipes-by-tag.component.css'
})
export class RecipesByTagComponent implements OnInit {
  recipes: Recipe[] = [];
  tag: string = '';
  isLoggedIn: boolean = false; // встановлювати автоматично з сесії
  private authSubscription!: Subscription;
  private routeSubscription!: Subscription;
  isLoading: boolean = false; // Індикатор завантаження
  isStartLoading: boolean = true;
  allRecipesLoaded: boolean = false; // Індикатор, коли всі рецепти завантажені
  start: number = 1; // Початковий індекс
  limit: number = 2; // Кількість рецептів для одного запиту
  authorId: string = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.recipes = [];

    
		
		
		
		
		
		
		// Підписуємося на зміни в URL
    this.routeSubscription = this.route.url.subscribe((segments) => {
      // Перевіряємо, чи є достатньо сегментів в шляху
      if (segments.length > 1) {
        this.tag = segments[2].path; // Отримуємо категорію з шляху
        console.log('tag:', this.tag);
				window.scrollTo(0, 0);

        this.start = 1; // Скидаємо пагінацію
        this.recipes = []; // Очищаємо старі рецепти
        this.allRecipesLoaded = false; // Скидаємо індикатор завантаження всіх рецептів
        this.loadRecipes(); // Завантажуємо нові рецепти
      } else {
        this.router.navigate(['/recipes']);
      }
    });
    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      }
    );

    this.isStartLoading = false;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadRecipes(): void {
    if (this.isLoading || this.allRecipesLoaded) return;

    this.isLoading = true;

		this.blogService
		.getRecipesByTag(this.start, this.limit, this.tag)
		.subscribe({
			next: ({ totalCount, recipes }) => {
				if (recipes && recipes.length > 0) {
					this.recipes.push(...recipes); // Додаємо нові рецепти
					this.start++; // Зсуваємо початковий індекс
					console.log('КК рецептів в масиві=' + this.recipes.length);
					try {
						console.log(recipes[0].recipeName);
					} catch {
						console.error('Не вдалося зчитати назву першого рецепта');
					}
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
    const halfStar = fullStars< rating? 1 : 0; // Половинна зірочка (якщо є)
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
}

