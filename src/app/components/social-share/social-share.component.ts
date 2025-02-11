import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.css'],
})
export class SocialShareComponent implements OnInit {
  currentUrl: string = '';
  imageUrl: string = '';
	description: string = 'Check out this amazing recipe!';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Отримуємо базову URL (протокол + домен)
    const baseUrl = window.location.origin;

    // Отримуємо поточний шлях з Angular Router
    this.router.events.subscribe(() => {
      const path = this.router.url; // Отримуємо шлях з Angular Router
      this.currentUrl = baseUrl + path; // Об'єднуємо базову URL і шлях
      
      // Шукаємо перше зображення на сторінці
      this.findImage(); // Лог для перевірки
    });
  }

  findImage() {
    // Шукаємо перше зображення на сторінці
    const firstImage = document.querySelector('img');
    if (firstImage && firstImage instanceof HTMLImageElement) {
      this.imageUrl = firstImage.src; // Отримуємо URL зображення
    }
    
  }
}
