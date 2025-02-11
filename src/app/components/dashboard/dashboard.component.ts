import { CommonModule } from '@angular/common';
import { firstValueFrom, Observable, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, tap } from 'rxjs/operators';

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import DOMPurify from 'dompurify';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { Subscription } from 'rxjs';
import { City } from '../../models/city.model';
import { Country } from '../../models/country.model';
import { User } from '../../models/user.model';
import { GeographyService } from '../../services/geography.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    QuillModule,
    RouterModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  newPassword: string = '';
  confirmPassword: string = '';

  me: User | null = null;
  sanitizedAbout: string = '';
  countries: Country[] = [];
  cities: City[] = [];
  selectedCountry: Country | null = null;
  selectedCity: City | null = null;
  newCityName: string = '';
  selectedCountryId: string = '';
  message: string = '';

  isLoggedIn: boolean = false;
  isEmailConfirmed: boolean = false;
  isEmailRequestSent: boolean = false;
  emailCode: string = '';
  isLoading: boolean = true;

  errorMessage: string = '';

  private authSubscription!: Subscription;
  private emailSubscription!: Subscription;
  selectedImage: File | null = null;
  private countrySearchSubject = new Subject<string>();
  private citySearchSubject = new Subject<string>();

  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  constructor(
    private router: Router,
    private userService: UserService,
    private imageUploadService: ImageUploadService,
    private geographyService: GeographyService
  ) {}

  onDeleteAccount() {
    if (this.me)
      this.userService.deleteUser(this.me.id).subscribe({
        next: () => {
          this.userService.logout(); // Вийти з сесі�� при видаленні акаунта
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = 'Не вдалося видалити акаунт. Спробуйте ще раз.';
          console.error('Помилка при видаленні акаунта:', error);
        },
      });
  }
  onCountryBlur() {
    const isValidCountry = this.countries.some(
      (country) => country.countryName === this.selectedCountry?.countryName
    );
    if (!isValidCountry) {
      this.selectedCountry = null;
      this.cities = [];
      this.selectedCity = null;
    } else {
      this.selectedCity = null;
    }
  }
  onCityBlur(): void {
    const input = document.querySelector(
      'input[name="selectedCity"]'
    ) as HTMLInputElement;

		this.selectedCity=null;
    const query = input.value;
    const ValidCity = this.cities.find((city) => city.cityName === query);
    if (!ValidCity) {
      this.newCityName = query;
    }
		else{this.selectedCity=ValidCity;
			this.newCityName ='';
		}
  }
	async saveChanges() {
		console.log('this.newCityName' + this.newCityName);
		try {
			// Перевірка на додавання нового міста
			if (
				this.formValid() &&
				this.me &&
				!this.selectedCity &&
				this.newCityName.length > 0
			) {
				await firstValueFrom(this.onAddNewCity());
				console.log('Місто додано успішно');
				// Додаткова логіка після успішного додавання міста
			}
	
			// Тепер виконуватиметься оновлення інформації користувача
			if (this.formValid() && this.me && this.selectedCity) {
				let updatedUserData: any = {
					firstName: this.me.firstName,
					lastName: this.me.lastName,
					profilePhotoUrl: this.me.profilePhotoUrl,
					about: this.sanitizedAbout,
					cityId: this.selectedCity ? this.selectedCity.id : '',
				};
			
				// Перевіряємо, чи пароль не порожній, і додаємо його тільки в цьому випадку
				if (this.newPassword == this.confirmPassword && this.newPassword != '') {
					updatedUserData.password = this.newPassword;
					this.newPassword = '';
					this.confirmPassword = '';
				} 
			
				// Якщо password не було додано (якщо це порожній рядок), видалимо його з об'єкта
				if (updatedUserData.password === '') {
					delete updatedUserData.password;
				}
			
				// Оновлення користувача
				const response = await firstValueFrom(this.userService.updateUser(this.me.id, updatedUserData));
				console.log('Інформація про користувача оновлена, ', response.message);
				this.errorMessage = 'Інформація про користувача оновлена';
			}
			
		} catch (error: unknown) {
			console.error('Помилка при виконанні:', error);
			// Перевірка на тип помилки
			if (error instanceof Error) {
				if (error.message.includes('Місто')) {
					this.errorMessage = 'Не вдалося додати місто: ' + error.message;
				} else {
					this.errorMessage = 'Не вдалося оновити інформацію. Спробуйте ще раз.';
				}
			} else {
				this.errorMessage = 'Не вдалося виконати операцію. Спробуйте ще раз.';
			}
		} finally {
			console.log('Оновлення завершено');
		}
	}
	
	
	

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
  sendEmailConfirmationRequest() {
    if (this.me) {
      this.userService
        .sendEmailConfirmationRequest(this.me.id)
        .pipe(
          tap((response: any) => {
            if (
              response?.message ===
              'Лист для підтвердження електронної пошти надіслано.'
            ) {
              this.message = '';
              this.isEmailRequestSent = true;
            } else {
              this.message = 'Помилка відправки листа';
              this.isEmailRequestSent = false;
            }
          })
        )
        .subscribe();
    }
  }

	async confirmEmail() {
		try {
			if (this.me && this.emailCode.length > 0) {
				const result = await firstValueFrom(
					this.userService.confirmEmail(this.emailCode)
				);
				if (result && result == 'Електронна пошта успішно підтверджена.') {
					this.isEmailConfirmed = true;
					this.isEmailRequestSent = false;
					this.message = '';
				} else {
					this.message = 'Помилка підвтердження електронної пошти';
					this.isEmailConfirmed = false;
					setTimeout(() => {
						window.location.reload();
					}, 2000);
				}
			}
		} catch (error) {
			this.message = 'Сталася помилка при підтвердженні електронної пошти';
			console.error(error);
		}
	}

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
    this.countrySearchSubject.unsubscribe();
    this.citySearchSubject.unsubscribe();
  }

  async ngOnInit() {
    this.errorMessage = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isLoading = true;

    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          this.userService.aboutme().subscribe({
            next: async (userData) => {
              if (userData) {
                this.me = userData;
                this.sanitizedAbout = DOMPurify.sanitize(this.me.about || '');

                await this.loadCountries();

                let countryName: string = this.me.country || '';
                if (countryName && this.countries.length) {
                  const selectedCountry = this.countries.find(
                    (country) => country.countryName === countryName
                  );
                  if (selectedCountry) {
                    this.selectedCountry = selectedCountry;
                    await this.loadCities(selectedCountry.id);
                    let cityName: string = this.me.city || '';
                    if (cityName && this.cities.length) {
                      const selectedCity = this.cities.find(
                        (city) => city.cityName === cityName
                      );
                      if (selectedCity) {
                        this.selectedCity = selectedCity;
                      }
                    }
                  }
                }
                this.isLoading = false;
              } else {
                this.router.navigate(['/login']);
              }
            },
            error: (err) => {
              console.error('Помилка завантаження даних користувача', err);
              this.isLoading = false;
              this.router.navigate(['/login']);
            },
          });
        } else {
          this.router.navigate(['/login']);
        }
      }
    );

    this.emailSubscription = this.userService.isEmailConfirmed.subscribe(
      (isEmailConfirmed) => {
        this.isEmailConfirmed = isEmailConfirmed;
      }
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }

    this.countrySearchSubject
      .pipe(debounceTime(500))
      .subscribe(async (query) => {
        await this.loadCountries(query);
      });

    this.citySearchSubject.pipe(debounceTime(500)).subscribe(async (query) => {
      await this.loadCities(this.selectedCountry?.id || '', query);
    });
  }

  async loadCountries(query: string = ''): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.geographyService.getCountries()
      );
      this.countries = response.filter((c) =>
        c.countryName.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Помилка при завантаженні країн:', error);
      // Можна додати обробку помилки, якщо потрібно
    }
  }

  async loadCities(countryId: string, query: string = ''): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.geographyService.getCities(countryId)
      );
      this.cities = response.filter((city) =>
        city.cityName.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Помилка при завантаженні міст:', error);
      // Обробка помилки при запиті
    }
  }

  async onCountrySelect(country: Country): Promise<void> {
    if (country) {
      this.selectedCountry = country;
      if (this.me) {
        this.me.country = this.selectedCountry.countryName;
      }

      this.cities = [];
      this.selectedCity = null;
      await this.loadCities(country.id);
    }
  }

  onCitySelect(city: City): void {
    if (city) {
      this.selectedCity = city;
      if (this.me) {
        this.me.city = this.selectedCity?.cityName;
      }
    }
  }

  onCountryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      const query = input.value;

      if (query) {
        this.countrySearchSubject.next(query);
      } else {
        this.countries = [];
      }
    }
  }

  async onCityInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    if (query) {
      this.citySearchSubject.next(query);
    } else {
      await this.loadCities(this.selectedCountry?.id || '');
    }
  }

  onAddNewCity(): Observable<City> {
    if (this.newCityName && this.selectedCountry) {
      return this.geographyService
        .addCity(this.newCityName, this.selectedCountry.id)
        .pipe(
          tap((newCity) => {
            this.cities.push(newCity);
            this.selectedCity = newCity;
            console.log('selectedCity=' + this.selectedCity.cityName);
            this.newCityName = '';
          }),
          catchError((error) => {
            console.error('Помилка при додаванні міста:', error);
            this.errorMessage = 'Помилка додавання міста';

            return throwError(() => new Error(error)); // Прокидаємо помилку далі
          })
        );
    } else {
      return throwError(() => new Error('Місто або країна не задані')); // Помилка валідації
    }
  }

  countryDisplayWith(country: Country): string {
    return country ? country.countryName : '';
  }

  cityDisplayWith(city: City): string {
    return city ? city.cityName : '';
  }

  ngAfterViewInit(): void {
    if (this.sanitizedAbout && this.quillEditor) {
      const editor = this.quillEditor.quillEditor;
      editor.setContents([{ insert: this.sanitizedAbout }]);
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
    if (this.me && this.selectedCountry) {
      return (
        this.me.firstName.trim() !== '' &&
        this.me.lastName.trim() !== '' &&
        this.selectedCountry.countryName.trim() !== '' &&
        this.newPassword === this.confirmPassword
      );
    } else return false;
  }
  uploadImage(): void {
    if (this.selectedImage) {
      this.imageUploadService.uploadImage(this.selectedImage).subscribe({
        next: (response) => {
          if (response && response.imageUrl && this.me) {
            this.me.profilePhotoUrl = response.imageUrl;
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

  // get isSubmitDisabled(): boolean {
  //   return !this.selectedCountry || !this.selectedCity;
  // }

  // get isEditButtonDisabled(): boolean {
  //   return !(this.selectedCountry && this.selectedCity);
  // }
}
