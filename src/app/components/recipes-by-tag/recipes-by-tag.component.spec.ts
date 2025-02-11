import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesByTagComponent } from './recipes-by-tag.component';

describe('RecipesByTagComponent', () => {
  let component: RecipesByTagComponent;
  let fixture: ComponentFixture<RecipesByTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesByTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesByTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
