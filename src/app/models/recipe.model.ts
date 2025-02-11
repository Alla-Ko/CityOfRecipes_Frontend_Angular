
export interface Recipe {
  id: string;
	categoryId: string;
	authorId: string;
	recipeName: string;
	preparationTimeMinutes: number;
	createdAt: string;
	ingredientsList: string;
	//ingredients: string[];
	//ingredientsText: string;
	instructionsText: string;
	videoUrl: string;
	photoUrl: string;


	isChristmas:boolean;
	isNewYear:boolean;
	isChildren:boolean;
	isEaster:boolean;
	
	averageRating: number;
	//totalRatings: number;
  slug: string;	
	tagsText: string;
	tags: string[];
	isParticipatedInContest: boolean;	
	//holidays: number[];


	//Поля для конкурсантів
	contestRating?: number;//необов'язкове поле
	authorName?:string;
	authorPhotoUrl?:string;
}