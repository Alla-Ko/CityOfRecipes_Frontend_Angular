import { Recipe } from './recipe.model';

export interface Contest {
  id: string;
  contestName: string;
  photoUrl: string;
  startDate: string;
  endDate: string;
  requiredIngredients: string;
  categoryId: string;
  contestRecipes: Recipe[];
  winningRecipes?: Recipe[];
  slug: string;
  contestDetails: string;
  isPressed?: boolean;
}
