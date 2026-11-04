import { TestBed } from '@angular/core/testing';
import { Api } from '../api';
import { CategoryList } from './category-list';

describe('CategoryList', () => {
  it('should create and show a card per category', async () => {
    const api = { categories: vi.fn().mockResolvedValue([{ id: 1, name: 'Dairy', itemCount: 1 }]) };
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [{ provide: Api, useValue: api }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryList);
    await fixture.whenStable(); // ngOnInit starts loading
    await new Promise((resolve) => setTimeout(resolve)); // the mocked API answers
    await fixture.whenStable(); // the page shows the answer
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('app-category-card').length).toBe(1);
  });
});
