import { CommonModule } from '@angular/common';

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { Navigation, Pagination } from 'swiper/modules';
import { BlogService } from '../../services/blog.service'; // Імпортуємо сервіс для постів

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent {
  ngOnInit() {
    const swiper = new Swiper('.swiper', {
      modules: [Navigation, Pagination],
      direction: 'horizontal',
      loop: true, // Включаємо loop
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'bullets',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });


  }

  constructor(private blogService: BlogService) {}
  slides = [
    {
      img: 'https://i.pinimg.com/736x/ad/b4/5f/adb45fa36a308e82b8b004e65e4bc40b.jpg',
      name: 'Олег Павловський',
      location: 'Україна, Київ',
      text: 'Чи існує дієва дієта без шкоди для здоров`я?',
      article_img:
        'https://i.pinimg.com/736x/a3/a2/13/a3a2133e993e01c11d91f89c948e892e.jpg',
    },
    {
      img: 'https://i.pinimg.com/736x/e1/3b/cb/e13bcb95e664f1b9174acf79f7449dbb.jpg',
      name: 'Галина Череповецька',
      location: 'Польща, Краків',
      text: 'Мед: користь і шкода для організму',
      article_img:
        'https://i.pinimg.com/736x/e7/ae/f7/e7aef70e3ff28594f6a2ef96271a0cd3.jpg',
    },
    {
      img: 'https://i.pinimg.com/736x/31/18/9f/31189ff5016a946b75cd643ad02c11ec.jpg',
      name: 'Юлія Місевич',
      location: 'Україна, Тернопіль',
      text: 'Як привчити дітей їсти більше овочів та фруктів: цікаві ідеї',
      article_img:
        'https://i.pinimg.com/736x/b5/5c/38/b55c38a90637defca4342d449e259301.jpg',
    },
    {
      img: 'https://i.pinimg.com/736x/e1/3b/cb/e13bcb95e664f1b9174acf79f7449dbb.jpg',
      name: 'Галина Череповецька',
      location: 'Польща, Краків',
      text: 'Як вибрати сковорідку?',
      article_img:
        'https://i.pinimg.com/736x/25/eb/38/25eb381109d5b733faeccf13d241a8c8.jpg',
    },
  ];

  ngAfterViewInit(): void {}
}
