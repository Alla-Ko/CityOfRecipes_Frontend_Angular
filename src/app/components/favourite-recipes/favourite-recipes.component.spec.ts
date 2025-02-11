import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavouriteRecipesComponent } from './favourite-recipes.component';

describe('FavouriteRecipesComponent', () => {
  let component: FavouriteRecipesComponent;
  let fixture: ComponentFixture<FavouriteRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouriteRecipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavouriteRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
