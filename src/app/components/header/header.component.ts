import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  pageTitle: string = 'Смакуй життя!';
  pageDescription: string = 'Рецепти для кожного дня та особливих моментів!';
  searchString: string = '';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
		this.searchString = "";	
    this.router.events.subscribe(() => {
      this.updateHeader();
    });
  } //dashboard

  updateHeader(): void {
    const currentRoute = this.router.url;

    if (currentRoute === '/contests/completed') {
      this.pageTitle = 'Завершені конкурси';
      this.pageDescription = 'Найкращі рецепти за версією містян';
    } else if (currentRoute === '/contests/active') {
      this.pageTitle = 'Поточні конкурси';
      this.pageDescription = 'Беріть участь у виборі переможців';
    } else if (currentRoute === '/dashboard') {
      this.pageTitle = 'Це твоя сторінка';
      this.pageDescription = 'Розкажи місту про себе';
    } else if (currentRoute.includes('/dashboard/my-recipes')) {
      this.pageTitle = 'Це твої рецепти';
      this.pageDescription = 'Подивися, чим ти поділився з містом';
    } else if (currentRoute.includes('/dashboard/favourite-chefs')) {
      this.pageTitle = 'Це твої улюблені автори';
      this.pageDescription =
        'Дивіться найкращі рецепти резидентів Міста Рецептів';
    } else if (currentRoute.includes('/dashboard/favourite-recipes')) {
      this.pageTitle = 'Це твої улюблені рецепти';
      this.pageDescription =
        'Зберігай найкраще, щоб спробувати приготувати самостійно';
    } else if (currentRoute === '/articles') {
      this.pageTitle = 'Цікаве про смачне';
      this.pageDescription = 'Дізнайтеся більше про улюблені страви';
    } else if (currentRoute.includes('recipes/categories/first-courses')) {
      this.pageTitle = 'Перші страви'; //679784a32f2da574297e0a5b
      this.pageDescription =
        'Смачні рецепти перших страв для обіду, суп, борщ, солянка, бограч...';
    } else if (currentRoute.includes('recipes/categories/second-courses')) {
      this.pageTitle = 'Другі страви'; //679785252f2da574297e0a5c
      this.pageDescription =
        'Покрокові рецепти других страв від резидентів Міста Рецептів';
    } else if (currentRoute.includes('recipes/categories/salads')) {
      this.pageTitle = 'Салати і закуски'; //679785482f2da574297e0a5d
      this.pageDescription = 'Почніть новий день зі смачного та корисного';
    } else if (currentRoute.includes('recipes/categories/baking')) {
      this.pageTitle = 'Випічка'; //679785682f2da574297e0a5e
      this.pageDescription = 'Дім - там де пахне смачною випічкою!';
    } else if (currentRoute.includes('recipes/categories/drinks')) {
      this.pageTitle = 'Напої'; //679785812f2da574297e0a5f
      this.pageDescription =
        'Компоти, узвари, коктейлі, особиві рецепти како, кави та чаю';
    } else if (currentRoute.includes('recipes/categories/canning')) {
      this.pageTitle = 'Консервації'; //679785d12f2da574297e0a60
      this.pageDescription =
        'Найкращі рецепти закруток, щоб взимку було смачненьке до столу';
    } else if (currentRoute.includes('recipes/categories/grill')) {
      this.pageTitle = 'Страви на грилі та мангалі'; //679786372f2da574297e0a61
      this.pageDescription = 'Великий вибір смачних домашніх рецептів на грилі';
		} else if (currentRoute.includes('recipes/categories/desserts')) {
      this.pageTitle = 'Солодкі страви'; //67a0d4b9a64140b53d752037
      this.pageDescription = 'Печиво, торти, парфе та інші солодощі';
    } else if (currentRoute.includes('recipes/categories/christmas')) {
      this.pageTitle = 'Різдво'; //1
      this.pageDescription = 'Без чого не обійдеться різдвяний стіл';
    } else if (currentRoute.includes('recipes/categories/new-year')) {
      this.pageTitle = 'Новий рік'; //2
      this.pageDescription = 'Сімейні традиції та нові відкриття';
    } else if (currentRoute.includes('recipes/categories/children')) {
      this.pageTitle = 'Дитяче свято'; //4
      this.pageDescription = 'Страви для маленьких та вибагливих';
    } else if (currentRoute.includes('recipes/categories/easter')) {
      this.pageTitle = 'Великдень'; //8
      this.pageDescription =
        'Традиційні рецепти до великоднього кошика та на святковий стіл';
    } else if (currentRoute === '/authors') {
      this.pageTitle = 'Список авторів';
      this.pageDescription = 'Ознайомтесь із нашими авторами';
    } else if (currentRoute.includes('/authors/')) {
      // Перевірка на динамічний маршрут
      this.pageTitle = 'Наші творці смачненького';
      this.pageDescription =
        'Тут Ви можете дізнатися детальну інформацію про автора';
    } else {
      this.pageTitle = 'Смакуй життя!';
      this.pageDescription = 'Рецепти для кожного дня та особливих моментів!';
    }
  }

  searchRecipes() {
    if (this.searchString.length > 0) {
      this.router.navigate(['recipes'], {
        queryParams: { search: this.searchString },
				
      });
			this.searchString = '';
			
    }
  }
}
