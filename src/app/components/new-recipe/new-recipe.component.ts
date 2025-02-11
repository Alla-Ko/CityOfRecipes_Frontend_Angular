import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import DOMPurify from 'dompurify';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Category } from '../../models/categoria.model';
import { Recipe } from '../../models/recipe.model';
import { BlogService } from '../../services/blog.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-new-recipe',
  imports: [
    CommonModule,
    QuillModule,
    RouterModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.css',
})
export class NewRecipeComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  newRecipe: Recipe = {
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
  myId: string = '';
  selectedCategory: Category = {
    id: '',
    categoryName: '',
    slug: '',
  };
  sanitizedInstructionsText: string = '';

  isLoggedIn: boolean = false;
  isEmailConfirmed: boolean = false;
  isLoading: boolean = true;

  errorMessage: string = '';

  private authSubscription!: Subscription;
  private emailSubscription!: Subscription;
  selectedImage: File | null = null;
  private categorySearchSubject = new Subject<string>();
  //private citySearchSubject = new Subject<string>();

  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  constructor(
    private blogService: BlogService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private userService: UserService,
    private imageUploadService: ImageUploadService
  ) {}
  async ngOnInit() {
    this.isLoading = true;

    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;

        if (isAuthenticated) {
          this.userService.aboutme().subscribe({
            next: (userData) => {
              if (userData) {
                this.myId = userData.id;
                // Пряма підписка на категорії
                this.blogService.getCategories().subscribe({
                  next: (categories) => {
                    if (categories.length > 0) {
                      this.categories = categories;
                      console.log(categories);
                      console.log(this.categories[0].id.toString());
                      this.filteredCategories = categories;
                      this.selectedCategory = this.filteredCategories[0];
                      console.log(
                        'this.selectedCategory.categoryId після загрузки категорій: ' +
                          this.selectedCategory.id.toString()
                      );
                    } else {
                      this.errorMessage =
                        'Помилка при завантаженні категорій рецептів';
                    }
                    this.isLoading = false; // Завершення завантаження
                  },
                  error: (err) => {
                    console.error('Помилка завантаження категорій', err);
                    this.isLoading = false;
                    this.router.navigate(['/login']);
                  },
                });
              } else {
                this.router.navigate(['/login']); //+++
              }
            },
            error: (err) => {
              console.error('Помилка завантаження даних користувача', err);
              this.isLoading = false;
              this.router.navigate(['/login']);
            },
          });
        } else {
          this.router.navigate(['/login']); //+++
        }
      }
    );
    this.emailSubscription = this.userService.isEmailConfirmed.subscribe(
      (isEmailConfirmed) => {
        this.isEmailConfirmed = isEmailConfirmed;
      }
    );

    this.categorySearchSubject
      .pipe(debounceTime(500))
      .subscribe(async (query) => {
        await this.loadCategories(query);
      });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
    this.categorySearchSubject.unsubscribe();
  }
  categoryDisplayWith(category: Category): string {
    return category ? category.categoryName : '';
  }

  onCategoryBlur() {
    const isValidCategoria = this.categories.some(
      (category) => category.id === this.selectedCategory?.id
    );
    console.log('isValidCategoria  ' + isValidCategoria);
    console.log(
      'this.selectedCategory?.categoryId ' +
        this.selectedCategory?.id.toString()
    );
    if (!isValidCategoria) {
      //this.selectedCategory = null;
    }
  }

  async save() {
    try {
      // Перевірка на додавання нового міста
      if (
        this.newRecipe &&
        this.isEmailConfirmed &&
        this.isLoggedIn &&
        this.formValid() &&
        this.myId.length > 0 &&
        this.selectedCategory
      ) {
        this.sanitizedInstructionsText = DOMPurify.sanitize(
          this.sanitizedInstructionsText || ''
        );
        console.log(
          'this.selectedCategory.categoryId перед збереженням рецепта: ' +
            this.selectedCategory.id.toString()
        );
        let updatedRecipeData: any = {
          categoryId: this.selectedCategory.id.toString(),
          recipeName: this.newRecipe.recipeName,
          preparationTimeMinutes: this.newRecipe.preparationTimeMinutes,
          ingredientsList: this.newRecipe.ingredientsList,
          instructionsText: this.sanitizedInstructionsText,
          videoUrl: this.newRecipe.videoUrl,
          photoUrl: this.newRecipe.photoUrl,
          tagsText: this.newRecipe.tagsText,
          isChristmas: this.newRecipe.isChristmas,
          isNewYear: this.newRecipe.isNewYear,
          isChildren: this.newRecipe.isChildren,
          isEaster: this.newRecipe.isEaster,
        };

        this.blogService.postRecipe(updatedRecipeData).subscribe({
          next: (recipe) => {
            // Обробка успішного результату
            console.log('Recipe posted successfully:', recipe.recipeName);
            // Можна виконати подальші дії, наприклад, відобразити повідомлення користувачу
            this.router.navigate(['/recipes', recipe.slug]); // Перехід до списку рецептів
          },
          error: (error) => {
            // Обробка помилки
            console.error('Error posting recipe:', error);
            this.errorMessage = error.message;
            // Можна відобразити помилку або зробити інші дії
          },
        });
      } else {
        this.errorMessage = 'Не всі поля заповнені коректно';
      }
    } catch (error: unknown) {
      console.error('Помилка при збереженні рецепта:', error);
      //this.errorMessage="Помилка при збереженні рецепта";
      // Перевірка на тип помилки
      if (error instanceof Error) {
        this.errorMessage = 'Не вдалося зберегти рецепт ' + error.message;
      } else {
        this.errorMessage = 'Не вдалося зберегти рецепт. Спробуйте ще раз.';
      }
    } finally {
      console.log('Збереження завершено');
    }
  }

  async onCategorySelect(category: Category): Promise<void> {
    console.log('category onCategorySelectd ' + category);

    if (category) {
      this.selectedCategory = category;
      if (this.selectedCategory)
        console.log(
          'this.selectedCategory.categoryId onCategorySelect: ' +
            this.selectedCategory.id.toString()
        );
      if (this.newRecipe) {
        this.newRecipe.categoryId = this.selectedCategory.id.toString();
        if (this.newRecipe)
          console.log(
            'newRecipe.categoryId onCategorySelect: ' +
              this.newRecipe.categoryId.toString()
          );
      }
    }
  }
  async loadCategories(query: string = ''): Promise<void> {
    this.filteredCategories = this.categories.filter((c) =>
      c.categoryName.toLowerCase().startsWith(query.toLowerCase())
    );
  }

  onCategoryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      const query = input.value;

      if (query) {
        this.categorySearchSubject.next(query);
      } else {
        this.filteredCategories = [];
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.sanitizedInstructionsText && this.quillEditor) {
      const editor = this.quillEditor.quillEditor;
      editor.setContents([{ insert: this.sanitizedInstructionsText }]);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedImage = input.files[0];
      this.uploadImage();
    }
  }
  formValid(): boolean {
    // Перевіряємо, чи всі основні поля заповнені
    if (this.selectedCategory && this.newRecipe && this.myId.length > 0) {
      return (
        this.newRecipe.categoryId.toString().length > 0 &&
        this.newRecipe.recipeName.trim() !== '' &&
        this.newRecipe.preparationTimeMinutes > 0 &&
        this.newRecipe.ingredientsList.trim() !== '' &&
        this.sanitizedInstructionsText.trim() !== ''
      );
    } else return false;
  }
  uploadImage(): void {
    if (this.selectedImage) {
      this.imageUploadService.uploadImage(this.selectedImage).subscribe({
        next: (response) => {
          if (response && response.imageUrl && this.newRecipe) {
            this.newRecipe.photoUrl = response.imageUrl;
          } else {
            console.error('Error uploading image');
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
        },
      });
    }
  }
  onTimeChange() {
    if (
      this.newRecipe.preparationTimeMinutes < 1 ||
      isNaN(this.newRecipe.preparationTimeMinutes)
    ) {
      this.newRecipe.preparationTimeMinutes = 30; // Середнє значення
    }
  }
  getEmbedUrl(url: string) {
    const youtubePattern =
      /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;
    if (youtubePattern.test(url)) {
      const videoId = this.extractYouTubeVideoId(url);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    }
    return null;
  }

  extractYouTubeVideoId(url: string): string | null {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  }
  onTimeBlur() {
    let inputValue = this.newRecipe.preparationTimeMinutes;

    // Перевірка, чи є значення числом (тільки позитивні числа)
    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      this.newRecipe.preparationTimeMinutes = 20; // значення за замовчуванням
    } else {
      // Переконуємося, що значення є дійсним числом
      this.newRecipe.preparationTimeMinutes = Math.abs(Number(inputValue));
    }
  }
}
