import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Для ngModel
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as validator from 'validator';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}
  ngOnInit(): void {
		window.scrollTo({
      top: 0, // Відступ 20 пікселів зверху
      behavior: 'smooth', // Плавна прокрутка
    });
	}
	async submitForm() {
		try {
			console.error('email ', this.email);
			if (!this.isValidEmail(this.email)) {
				this.errorMessage = 'Введіть корекнтну адресу електронної пошти';
			} else if (this.password.length < 3) {
				this.errorMessage = 'Введіть коректний пароль';
			} else {
				// Використання firstValueFrom замість toPromise
				const result = await firstValueFrom(this.userService.auth(this.email, this.password));
	
				if (result && result.token) {
					this.router.navigate(['/']);
				} else {
					this.email = '';
					this.password = '';
					this.errorMessage = 'Помилка авторизації';
				}
			}
		} catch (error) {
			this.errorMessage = 'Не вдалося виконати авторизацію';
		}
	}
	

  isValidEmail(email: string): boolean {
    console.log('Validating email:', email);
    return validator.default.isEmail(email);
  }
}
