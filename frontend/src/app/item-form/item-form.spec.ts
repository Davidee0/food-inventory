import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ItemForm } from './item-form';

const API = 'http://localhost:5050/api';

// The Add item page (lecture 9: component tests with TestBed and a mocked API).
describe('ItemForm', () => {
  let fixture: ComponentFixture<ItemForm>;
  let page: HTMLElement;
  let http: HttpTestingController;

  const tick = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ItemForm);
    page = fixture.nativeElement;
    fixture.detectChanges(); // ngOnInit loads the data
    http.expectOne(`${API}/storagelocation`).flush([{ id: 1, name: 'Fridge' }]);
    http.expectOne(`${API}/category`).flush([{ id: 1, name: 'Dairy' }]);
    http.expectOne(`${API}/fooditem`).flush([]);
    await tick();
    await fixture.whenStable();
  });

  const type = (selector: string, value: string) => {
    const input = page.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    page.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
  };
  const errors = () => [...page.querySelectorAll('mat-error')].map((e) => e.textContent?.trim());

  it('shows the Material form with the Add item title', () => {
    expect(page.querySelector('h1')?.textContent).toContain('Add new item');
    expect(page.querySelectorAll('mat-form-field').length).toBe(6);
  });

  it('an empty form shows the messages and sends nothing', async () => {
    type('#f-name', '');
    await submit();
    expect(errors()).toEqual(['Enter a name.', 'Choose a storage location.']);
    http.expectNone({ method: 'POST' });
  });

  it('a valid form is sent to the API', async () => {
    type('#f-name', ' Greek yogurt ');
    fixture.componentInstance['form'].controls.storageLocationId.setValue(1);
    await submit();
    const post = http.expectOne({ method: 'POST', url: `${API}/fooditem` });
    expect(post.request.body.name).toBe('Greek yogurt'); // trimmed
    expect(post.request.body.storageLocationId).toBe(1);
    expect(errors()).toEqual([]);
  });
});
