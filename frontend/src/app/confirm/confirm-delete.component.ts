import { AfterViewInit, Component, ElementRef, ViewChild, input, output } from '@angular/core';
import { ApiService, NETWORK_MESSAGE, toFailure } from '../core/api.service';
import { Item } from '../core/models';

@Component({
  selector: 'app-confirm-delete',
  template: `
    <dialog #dlg class="dialog" aria-labelledby="confirm-title" (cancel)="$event.preventDefault(); dlg.close()" (close)="closed.emit()">
      <h2 id="confirm-title">Delete {{ item().name }}?</h2>
      <p>This removes it from your inventory.</p>
      @if (error) { <p class="error banner" role="alert">{{ error }}</p> }
      <div class="actions">
        <button type="button" class="secondary" (click)="dlg.close()">Cancel</button>
        <button type="button" class="danger" [disabled]="busy" (click)="confirm()">{{ busy ? 'Deleting…' : 'Delete' }}</button>
      </div>
    </dialog>
  `,
})
export class ConfirmDeleteComponent implements AfterViewInit {
  item = input.required<Item>();
  deleted = output<void>();
  closed = output<void>();
  @ViewChild('dlg', { static: true }) dlg!: ElementRef<HTMLDialogElement>;
  error = '';
  busy = false;

  constructor(private api: ApiService) {}

  ngAfterViewInit() {
    this.dlg.nativeElement.showModal();
  }

  async confirm() {
    this.busy = true;
    this.error = '';
    try {
      await this.api.deleteItem(this.item().id);
      this.deleted.emit();
      this.dlg.nativeElement.close();
    } catch (e) {
      const f = toFailure(e);
      if (f.status === 404) {
        // Already gone: same result the user wanted.
        this.deleted.emit();
        this.dlg.nativeElement.close();
      } else {
        this.error = f.network ? NETWORK_MESSAGE : `Could not delete ${this.item().name}. Try again.`;
      }
    } finally {
      this.busy = false;
    }
  }
}
