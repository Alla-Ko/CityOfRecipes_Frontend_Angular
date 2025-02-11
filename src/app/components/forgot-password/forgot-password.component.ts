import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Для ngModel
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as validator from 'validator';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}
  async submitForm() {
    try {
      console.error('email ', this.email);
      // Чекаємо завершення авторизації
      if (!this.isValidEmail(this.email)) {
        this.errorMessage = 'Введіть корекнтну адресу електронної пошти';
      } else {
				this.userService.forgotPassword(this.email).subscribe({
					next: (response) => {
						// Відображаємо повідомлення про успіх
						this.successMessage = response.message || 'Лист для скидання паролю надіслано на вашу електронну пошту.';
					},
					error: (error) => {
						// Відображаємо помилку
						this.errorMessage = error || 'Не вдалося ініціювати скидання паролю. Спробуйте ще раз.';
						console.error('Помилка при скиданні паролю:', error);
					}
				});
      }
    } catch (error) {
      // Обробка випадків, якщо запит завершився помилкою

      this.errorMessage = 'Не вдалося виконати відновлення паролю';
    }
  }
  isValidEmail(email: string): boolean {
    console.log('Validating email:', email);
    return validator.default.isEmail(email);
  }
}
