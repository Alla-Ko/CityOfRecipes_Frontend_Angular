import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Для ngModel
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as validator from 'validator';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  repassword: string = '';
  errorMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}
	async submitForm() {
		try {
			if (!this.isValidEmail(this.email)) {
				this.errorMessage = 'Введіть коректну адресу електронної пошти';
			} else if (this.password.length < 6) { // Пароль має бути мінімум 6 символів
				this.errorMessage = 'Пароль має бути не менше 6 символів';
			} else if (this.password !== this.repassword) {
				this.errorMessage = 'Паролі не співпадають';
			} else {
				console.log('Sending request...');
				const result = await this.userService
					.register(this.email, this.password)
					.toPromise();
				console.log('Result:', result);
	
				if (result.message === 'Реєстрація успішна') {
					this.router.navigate(['/login']);
				} else {
					this.errorMessage = result.message || 'Помилка реєстрації';
				}
			}
		} catch (error) {
			console.error('Error during registration:', error); // Для діагностики
	
			if (error instanceof Error) {
				// Якщо помилка від сервісу, то error.message міститиме опис помилки
				this.errorMessage = error.message || 'Невідома помилка';
			} else if (error instanceof HttpErrorResponse) {
				// Обробка помилок сервера
				try {
					const serverError = error.error && typeof error.error === 'string' 
						? JSON.parse(error.error) 
						: error.error;
	
					if (serverError && serverError.error) {
						this.errorMessage = serverError.error;
					} else {
						this.errorMessage = 'Сервер повернув невідому помилку';
					}
				} catch (e) {
					console.error('Error parsing server response:', e); // Додаткова діагностика
					this.errorMessage = 'Невідома помилка сервера';
				}
			} else {
				this.errorMessage = 'Не вдалося виконати реєстрацію';
			}
		}
	}
	

  clearForm() {
    this.email = '';
    this.password = '';
    this.repassword = '';
  }
  isValidEmail(email: string): boolean {
    return validator.default.isEmail(email);
  }
  ngOnInit(): void {
    window.scrollTo({
      top: 0, // Відступ 20 пікселів зверху
      behavior: 'smooth', // Плавна прокрутка
    });
  }
}
