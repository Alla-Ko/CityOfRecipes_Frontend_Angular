import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../models/recipe.model';
import { BlogService } from '../../services/blog.service'; // Імпортуємо сервіс для постів
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home-recipes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home-recipes.component.html',
  styleUrl: './home-recipes.component.css',
})
export class HomeRecipesComponent implements OnInit {
  recipes: Recipe[] = [];
  loading: boolean = true; // Статус завантаження
  numberOfRecipes: number = 0;

  constructor(
    private blogService: BlogService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    this.loading = true;
    this.blogService.getRecipes(1, 4).subscribe({
      next: ({ totalCount, recipes }: { totalCount: number; recipes: Recipe[] }) => {
        this.recipes = recipes;
        this.numberOfRecipes = totalCount;
				console.log("total"+totalCount);
        
      },
      error: (error: any) => {
        console.error('Error retrieving popular recipes', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // Обробник події прокручування
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;

    // if (scrollPosition >= documentHeight - 100 && !this.allPostsLoaded) {
    //   // Якщо прокручено донизу і ще є пости для завантаження
    //   //this.loadPosts(); // Завантажуємо нові пости
    // }
  }
}
