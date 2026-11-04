import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Api } from '../api';
import { ItemForm } from './item-form';

describe('ItemForm', () => {
  let component: ItemForm;
  let fixture: ComponentFixture<ItemForm>;

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = vi.fn(); // jsdom has no dialogs
    await TestBed.configureTestingModule({
      imports: [ItemForm],
      providers: [{ provide: Api, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the messages of an empty form and sends nothing', async () => {
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('#f-name') as HTMLInputElement).value = '';
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(element.querySelector('#e-name')?.textContent).toBe('Enter a name.');
    expect(element.querySelector('#e-location')?.textContent).toBe('Choose a storage location.');
  });
});
