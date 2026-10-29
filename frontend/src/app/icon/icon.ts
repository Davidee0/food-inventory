import { Component, input } from '@angular/core';

/** A small line drawing, e.g. <app-icon name="plus" />. The drawings are fixed here, never user text. */
@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
      @switch (name()) {
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('list') {
          <path d="M8 6.5h12M8 12h12M8 17.5h12" />
          <circle cx="4" cy="6.5" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="17.5" r="1" />
        }
        @case ('gear') {
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path
            d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2 2M16.7 16.7l2 2M18.7 5.3l-2 2M7.3 16.7l-2 2"
          />
        }
        @case ('search') {
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        }
        @case ('pencil') {
          <path d="M4 20l1.2-4.2L16.6 4.4a2 2 0 0 1 2.8 2.8L8 18.6z" />
        }
        @case ('chev') {
          <path d="M9 5l7 7-7 7" />
        }
        @case ('back') {
          <path d="M15 5l-7 7 7 7" />
        }
        @case ('tick') {
          <circle cx="12" cy="12" r="10" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        }
        @case ('warn') {
          <path class="warn" d="M12 3.2L2.4 20h19.2z" />
          <path d="M12 9.6v4.6M12 17.1v.1" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    svg {
      display: block;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .warn {
      fill: var(--warn);
      stroke: var(--ink);
    }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(24);
}
