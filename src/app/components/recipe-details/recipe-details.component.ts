import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import DOMPurify from 'dompurify';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { Category } from '../../models/categoria.model';
import { Contest } from '../../models/contest.model';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { BlogService } from '../../services/blog.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-recipe-details',
  imports: [RouterModule, CommonModule],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.css',
})
export class RecipeDetailsComponent implements OnInit {
  slug: string = '';
  errorMessage: string = '';
  recipeContests: Contest[] = [];
  availableContests: Contest[] = [];
  recipe: Recipe = {
    id: '',
    authorId: '',
    categoryId: '',
    recipeName: '',
    preparationTimeMinutes: 0,
    createdAt: '',
    ingredientsList: '',
    instructionsText: '',
    videoUrl: '',
    photoUrl: '',
    averageRating: 0,
    slug: '',
    tagsText: '',
    tags: [],

    isChristmas: false,
    isNewYear: false,
    isChildren: false,
    isEaster: false,
    isParticipatedInContest: false,
  };
  sanitizedInstructionsText: string = '';
  category: Category = {
    id: '',
    categoryName: 'Категорія рецепта не зазначена',
    slug: '',
  };

  author: User = {
    id: '',
    email: '',
    roleId: 0,
    firstName: 'Немає інформації про автора',
    lastName: '',
    profilePhotoUrl: '',
    country: '',
    city: '',
    registrationDate: '',
    rating: 0,
  };
  myId: string = '';

  isLoggedIn: boolean = false; //встановлювати автоматично з сесії
  isFavorite: boolean = false; //чи рецепт у нього в улюблених
  isAuthor: boolean = false; // чи є користувач автором

  isLoading = true;
  infoMessage: string = '';
  myRating: number = 0; // Зберігає поточну оцінку
  hoverRating: number = 0; // Оцінка при наведенні
	enableButtons: boolean = true;
  private authSubscription!: Subscription;
  deleteMessage: string = '';

  constructor(
    private blogService: BlogService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const slug = this.route.snapshot.paramMap.get('slug');
    this.isLoading = true;

    if (slug && slug.trim().length > 0) {
      this.slug = slug;

      this.blogService.getRecipeBySlug(this.slug).subscribe({
        next: (recipe) => {
          if (recipe) {
						this.enableButtons = !recipe.isParticipatedInContest;
            this.recipe = recipe;
            this.sanitizedInstructionsText = DOMPurify.sanitize(
              this.recipe.instructionsText ? this.recipe.instructionsText : ''
            );

            // Використовуємо forkJoin для одночасного виконання всіх запитів
            forkJoin({
              categories: this.blogService.getCategories(),
              author: this.userService.getUserById(this.recipe.authorId),
              me: this.userService.aboutme(),
              favoriteRecipes: this.blogService.getFavoriteRecipes(1, 1),
              favoriteAuthors: this.userService.getFavoriteAuthors(),
            }).subscribe({
              next: ({
                categories,
                author,
                me,
                favoriteRecipes,
                favoriteAuthors,
              }) => {
                // Завантажуємо категорії
                const category = categories.find(
                  (c) => c.id === this.recipe.categoryId
                );
                if (category) {
                  this.category = category;
                }
                if (me) {
                  this.isLoggedIn = true;
                  this.myId = me.id;
                }
                // Завантажуємо автора
                if (author) this.author = author;
                if (author && me && author.id == me.id) this.isAuthor = true;
                // Перевірка, чи є рецепт в обраних
                const isFavorite = favoriteRecipes.recipes.some(
                  (r) => r.id === this.recipe.id
                );
                this.isFavorite = isFavorite;
                if (
                  favoriteAuthors &&
                  favoriteAuthors.authors &&
                  Array.isArray(favoriteAuthors.authors)
                ) {
									const isFavorite = favoriteAuthors.authors.some(
										(a) => a.id === this.author.id
									);
									this.author.isfavorited = isFavorite;	
		
                }
                // Завершуємо завантаження
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Помилка при завантаженні даних', err);
                this.isLoading = false;
              },
            });

            forkJoin({
              recipeContests: this.loadActiveContests(),
              availableContests: this.loadAvailableContests(),
            }).subscribe({
              next: ({ recipeContests, availableContests }) => {
                //завантажуємо діючі і доступні конкурси
                this.recipeContests = [];
                this.availableContests = [];
                if (recipeContests) this.recipeContests = recipeContests;
                if (availableContests)
                  this.availableContests = availableContests;
                // Завершуємо завантаження
              },
              error: (err) => {
                console.error('Помилка при завантаженні даних', err);
                this.isLoading = false;
              },
            });
          } else {
            console.log('Рецепт по слагу не знайдено' + this.slug);
            this.router.navigate(['/recipes']);
          }
        },
        error: (err) => {
          console.error('Помилка завантаження рецепта', err);
          this.isLoading = false;
          this.router.navigate(['/recipes']);
        },
      });
    } else {
      console.log('Слаг рецепта не передано');
      this.router.navigate(['/recipes']);
    }
  }
  ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
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
  onScroll(): void {}

  toggleFavoriteAuthor(user: User): void {
    this.userService.toggleFavoriteAuthor(user.id).subscribe({
      next: (response) => {
        console.log(response.message); // Логування повідомлення

        // Оновлюємо список улюблених авторів після зміни статусу
        this.userService.getFavoriteAuthors().subscribe({
          next: (response) => {
            // Переконуємось, що `response.authors` є масивом
            if (
              response &&
              response.authors &&
              Array.isArray(response.authors)
            ) {
              // Оновлюємо статус isfavorited у відповідному user
              user.isfavorited = false;
              const isFavorited =
                response?.authors?.some((fav) => fav.id === user.id) ?? false;
              user.isfavorited = isFavorited;
            }
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
  toggleFavorite() {
    this.blogService.toggleFavorite(this.recipe.id).subscribe({
      next: (response) => {
        console.log(response.message); // Лог для перевірки

        if (response.message.includes('видалено')) {
          this.isFavorite = false;
        } else if (response.message.includes('додано')) {
          this.isFavorite = true;
        }
      },
      error: (err) => {
        console.error('Помилка при зміні статусу улюбленого рецепта:', err);
      },
    });
  }
  rateRecipe(starCount: number) {
    this.blogService.rateRecipe(this.recipe.id, starCount).subscribe({
      next: (response) => {
        console.log(response.message);
        this.myRating = starCount; // Зберігаємо оцінку після натискання
        this.infoMessage = `Ви оцінили рецепт на ${starCount} `; // Повідомлення для користувача
        this.blogService.getRecipeById(this.recipe.id).subscribe({
          next: (recipe) => {
            this.recipe.averageRating = recipe.averageRating;
          },
          error: (err) => {
            console.error('Помилка при завантаженні рецепта', err);
          },
        });
      },
      error: (err) => {
        console.error('Помилка при оцінки рецепта:', err);
        this.infoMessage = 'Помилка при оцінки рецепта';
      },
    });
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
  videoLoaded = false;

  loadVideo() {
    this.videoLoaded = true;
  }

  getThumbnailUrl(url: string): string {
    const videoId = this.extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  }

  getEmbedUrl(url: string) {
    const videoId = this.extractYouTubeVideoId(url);
    return videoId
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&wmode=opaque&rel=0`
        )
      : null;
  }

  extractYouTubeVideoId(url: string): string | null {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  }
  confirmDelete() {
    if (confirm('Ви впевнені, що хочете видалити цей чудовий рецепт?')) {
      this.deleteRecipe();
    }
  }

  deleteRecipe() {
    this.blogService.deleteRecipe(this.recipe.id).subscribe({
      next: (response) => {
        this.router.navigate(['/recipes']);
        console.log('Рецепт видалено');
      },
      error: (err) => {
        console.error('Помилка при видаленні рецепта:', err);
        this.deleteMessage = 'Помилка при видаленні рецепта';
      },
    });
  }
  //addRecipeToContest(contestId: string,recipeId: string): Observable<{ message: string }>
	sendToContest(contestId: string) {
		this.blogService.addRecipeToContest(contestId, this.recipe.id).subscribe({
			next: (response) => {
				if (response.message.includes('успішно')) {
					this.enableButtons=false;
					forkJoin({
						recipeContests: this.loadActiveContests(),
						availableContests: this.loadAvailableContests(),
					}).subscribe({
						next: ({ recipeContests, availableContests }) => {
							// Оновлюємо списки відразу після отримання даних
							this.recipeContests = recipeContests || [];
							this.availableContests = availableContests || [];
	
							// Якщо потрібно видалити з availableContests конкретний конкурс
							const contestIndex = this.availableContests.findIndex((c) => c.id === contestId);
							if (contestIndex !== -1) {
								this.availableContests.splice(contestIndex, 1);
							}
						},
						error: (err) => {
							console.error('Помилка при завантаженні даних', err);
							this.isLoading = false;
						},
					});
				} else if (response.message.includes('помилка')) {
					this.errorMessage = 'Помилка при додаванні рецепта на конкурс. ' + response.message;
				}
			},
			error: (err) => {
				this.errorMessage = 'Помилка при додаванні рецепта на конкурс. ';
				console.log(err);
			},
		});
	}
	
  loadActiveContests(): Observable<Contest[]> {
    return this.blogService.getContestsForParticipatedRecipe(this.recipe.id);
  }
  loadAvailableContests(): Observable<Contest[]> {
    return this.blogService.getContestsForRecipe(this.recipe.id);
  }
}
