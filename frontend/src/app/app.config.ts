import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: the :id of the route arrives in @Input() id of EditFoodItem (Lecture 7).
    provideRouter(routes, withComponentInputBinding()),
    // Lecture 6: makes HttpClient available to the services.
    provideHttpClient(),
  ],
};
