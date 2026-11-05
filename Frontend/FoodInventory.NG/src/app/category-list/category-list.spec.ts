import { TestBed } from '@angular/core/testing';
import { Api } from '../api';
import { Category } from '../model/category';
import { CategoryList } from './category-list';

describe('CategoryList', () => {
  async function render(categories: Category[]) {
    const api = { categories: vi.fn().mockResolvedValue(categories) };
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [{ provide: Api, useValue: api }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CategoryList);
    await fixture.whenStable(); // ngOnInit starts loading
    await new Promise((resolve) => setTimeout(resolve)); // the mocked API answers
    await fixture.whenStable(); // the page shows the answer
    return fixture;
  }

  it('should create and show a card per category', async () => {
    const fixture = await render([{ id: 1, name: 'Dairy', itemCount: 1 }]);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('app-category-card').length).toBe(1);
  });

  it('says when there are no categories', async () => {
    const fixture = await render([]);
    expect(fixture.nativeElement.textContent).toContain('No categories yet. Add one above.');
  });
});
