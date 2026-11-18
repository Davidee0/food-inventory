import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Lecture 5 and 7: zone.js (imported in main.ts) tells Angular when to update the page.
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withComponentInputBinding: the :id of the route arrives in @Input() id of EditFoodItem (Lecture 7).
    provideRouter(routes, withComponentInputBinding()),
    // Lecture 6: makes HttpClient available to the services.
    provideHttpClient(),
  ],
};
