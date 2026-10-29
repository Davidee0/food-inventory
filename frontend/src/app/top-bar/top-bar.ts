import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

/** The header of every page: U8 (or a back arrow) on the left, the title in the middle, the gear (Settings) on the right. */
@Component({
  selector: 'app-top-bar',
  imports: [RouterLink, Icon],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  /** Where the back arrow goes. Without it, the header shows U8 and the gear (Settings). */
  readonly back = input<string>();
}
