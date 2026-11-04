import { TestBed } from '@angular/core/testing';
import { Api } from '../api';
import { ItemList } from './item-list';

describe('ItemList', () => {
  const api = { locations: vi.fn(), categories: vi.fn(), items: vi.fn() };

  beforeEach(async () => {
    api.locations.mockResolvedValue([{ id: 1, name: 'Fridge' }]);
    api.categories.mockResolvedValue([]);
    api.items.mockResolvedValue([]);
    await TestBed.configureTestingModule({
      imports: [ItemList],
      providers: [{ provide: Api, useValue: api }],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(ItemList);
    await fixture.whenStable(); // ngOnInit starts loading
    await new Promise((resolve) => setTimeout(resolve)); // the mocked API answers
    await fixture.whenStable(); // the page shows the answer
    return fixture;
  }

  it('should create', async () => {
    expect((await render()).componentInstance).toBeTruthy();
  });

  it('shows the empty state when there are no items', async () => {
    expect((await render()).nativeElement.textContent).toContain('Nothing here yet.');
  });

  it('shows the error and Try again when loading fails', async () => {
    api.items.mockRejectedValue(new Error('down'));
    const text = (await render()).nativeElement.textContent;
    expect(text).toContain('Could not load your items.');
    expect(text).toContain('Try again');
  });
});
