import { Routes } from '@angular/router';
import { AuthorDetailComponent } from './components/author-detail/author-detail.component';
import { AuthorsComponent } from './components/authors/authors.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { ContestDetailComponent } from './components/contest-detail/contest-detail.component';
import { ContestsComponent } from './components/contests/contests.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EditRecipeComponent } from './components/edit-recipe/edit-recipe.component';
import { FavoriteAuthorsComponent } from './components/favorite-authors/favorite-authors.component';
import { FavouriteRecipesComponent } from './components/favourite-recipes/favourite-recipes.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MyRecipesComponent } from './components/my-recipes/my-recipes.component';
import { NewRecipeComponent } from './components/new-recipe/new-recipe.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RecipeDetailsComponent } from './components/recipe-details/recipe-details.component';
import { RecipesByTagComponent } from './components/recipes-by-tag/recipes-by-tag.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
export const routes: Routes = [
  { path: '', component: HomeComponent }, //є
  { path: 'authors', component: AuthorsComponent }, //є
  { path: 'authors/:id', component: AuthorDetailComponent }, //є
  { path: 'login', component: LoginComponent }, //є
  { path: 'register', component: RegisterComponent }, //є
  { path: 'forgot-password', component: ForgotPasswordComponent }, //є
  { path: 'reset-password', component: ResetPasswordComponent }, //є
  { path: 'dashboard', component: DashboardComponent }, //є

  { path: 'recipes/new-recipe', component: NewRecipeComponent }, //є
  { path: 'recipes/:slug', component: RecipeDetailsComponent }, //є
  { path: 'recipes/edit/:slug', component: EditRecipeComponent }, //є

  { path: 'dashboard/my-recipes', component: MyRecipesComponent }, //є
  { path: 'dashboard/favourite-recipes', component: FavouriteRecipesComponent }, //є
  { path: 'dashboard/favourite-chefs', component: FavoriteAuthorsComponent }, //є
  { path: 'recipes', component: RecipesComponent }, //є
  { path: 'recipes/categories/:categoria', component: CategoriesComponent }, //є
  { path: 'recipes/tags/:tag', component: RecipesByTagComponent }, //є

  // { path: 'articles', component: HomeComponent }, //------------------------------------------------
  // { path: 'articles/:slug', component: HomeComponent }, //------------------------------------------------

  {
    path: 'contests/active',
    component: ContestsComponent,
    data: { status: 'active' },
  },
  {
    path: 'contests/completed',
    component: ContestsComponent,
    data: { status: 'completed' },
  },	
  { path: 'contests/:slug', component: ContestDetailComponent },
  //компонент для рецептів по конкурсу не потребує роута вшити в сторінку конкурсу
  { path: '**', component: NotFoundComponent },
];
