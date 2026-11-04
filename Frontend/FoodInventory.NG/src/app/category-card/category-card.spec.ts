import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryCard } from './category-card';

describe('CategoryCard', () => {
  let component: CategoryCard;
  let fixture: ComponentFixture<CategoryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('category', { id: 1, name: 'Dairy', itemCount: 1 });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the name in its field and "1 item"', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('input')?.value).toBe('Dairy');
    expect(element.textContent).toContain('1 item');
  });
});
