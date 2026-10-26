import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

/** The frame of every page: the header with the links, and the page of the current route below it. */
@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Food inventory');
}
