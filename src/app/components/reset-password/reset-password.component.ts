import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Для ngModel
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as validator from 'validator';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  repassword: string = '';
  token: string | null = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}
  ngOnInit() {
		this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token'); // Отримуємо значення query-параметра
      console.log('Token:', this.token);
    });

    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }
  submitForm(): void {
    this.errorMessage = ''; // Очищення помилок перед перевіркою

    // Перевірка пароля
    if (!this.isValidPassword(this.password)) {
      this.errorMessage =
        'Введіть коректний пароль - 6 символів, хочаб 1 цифра, хочаб 1 велика латинська літера, хочаб 1 маленька латинська літера';
      return;
    }

    if (this.password !== this.repassword) {
      this.errorMessage = 'Паролі не співпадають';
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Токен для зміни пароля відсутній.';
      return;
    }

    // Викликаємо метод resetPassword із сервісу
    this.userService.resetPassword(this.token, this.password).subscribe({
      next: (result: { message: string }) => {
        if (result?.message === 'Пароль успішно оновлено.') {
          this.router.navigate(['/login']); // Перехід на сторінку логіну
        } else {
          this.errorMessage = result?.message || 'Помилка зміни паролю';
          this.password = '';
          this.repassword = '';
        }
      },
      error: (error) => {
        console.error('Помилка під час зміни паролю:', error);
        this.errorMessage =
          'Не вдалося виконати зміну паролю. Спробуйте пізніше.';
      },
    });
  }
  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  }
  isValidEmail(email: string): boolean {
    console.log('Validating email:', email);
    return validator.default.isEmail(email);
  }
}
