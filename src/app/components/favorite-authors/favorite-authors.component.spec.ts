import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteAuthorsComponent } from './favorite-authors.component';

describe('FavoriteAuthorsComponent', () => {
  let component: FavoriteAuthorsComponent;
  let fixture: ComponentFixture<FavoriteAuthorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteAuthorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
