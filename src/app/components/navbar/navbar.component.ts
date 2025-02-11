import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Імпортуємо модель Post // Імпортуємо сервіс для постів
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  constructor(private router: Router, private userService: UserService) {}
  isSticky: boolean = false;
  activeLink: string = 'articles';
  isLoggedin: boolean = false; //встановлювати автоматично з сесії
	private authSubscription!: Subscription;

	ngOnInit() {
    // Підписка на зміну стану авторизації
    this.authSubscription = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedin = isAuthenticated;
        console.log('User login status:', this.isLoggedin);
      }
    );
  }
	
  setActive(link: string): void {
    this.activeLink = link;
  }
	logout(): void {
    this.userService.logout();
    window.location.reload();
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Перевіряємо, чи прокрутка перевищує 45px
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isSticky = scrollTop > 45;
    
  }
	ngOnDestroy() {
    // Очистка підписки, щоб уникнути витоків пам’яті
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
