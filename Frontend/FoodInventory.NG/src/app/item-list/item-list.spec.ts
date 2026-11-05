import { TestBed } from '@angular/core/testing';
import { Api } from '../api';
import { Item } from '../model/item';
import { ItemList } from './item-list';

describe('ItemList', () => {
  const api = { locations: vi.fn(), categories: vi.fn(), items: vi.fn(), deleteItem: vi.fn() };

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

  it('asks before deleting, and then says it is done', async () => {
    const milk: Item = {
      id: 1,
      name: 'Milk',
      locationId: 1,
      categoryId: null,
      purchaseDate: '2026-11-01',
      bestBefore: null,
      locationName: 'Fridge',
      categoryName: null,
    };
    api.items.mockResolvedValue([milk]);
    api.deleteItem.mockResolvedValue(null);
    const ask = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;
    const remove = () =>
      page.querySelector<HTMLButtonElement>('[aria-label="Delete Milk"]')!.click();

    remove(); // Cancel keeps the item
    expect(ask).toHaveBeenCalledWith('Delete Milk?');
    expect(api.deleteItem).not.toHaveBeenCalled();

    remove(); // OK deletes it
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    expect(api.deleteItem).toHaveBeenCalledWith(1);
    expect(page.querySelector('[role="status"]')?.textContent).toBe('Deleted Milk.');
    expect(page.querySelectorAll('app-item-card').length).toBe(0);
    ask.mockRestore();
  });
});
