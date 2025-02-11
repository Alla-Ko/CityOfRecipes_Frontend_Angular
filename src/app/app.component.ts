import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AsideComponent } from './components/aside/aside.component';

import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SocialShareComponent } from './components/social-share/social-share.component';
import { WowService } from './services/wow.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SocialShareComponent,
    HeaderComponent,
    NavbarComponent,
    AsideComponent,
  ],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit, OnInit {
  showScrollToTop = false;
  constructor(private wowService: WowService, private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.wowService.initWow(); // Викликаємо метод ініціалізації WOW.js із сервісу
  }
  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Прокрутка до початку сторінки
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollToTop = window.scrollY > 200; // Показуємо кнопку, якщо прокрутили більше 200px
  }
}
