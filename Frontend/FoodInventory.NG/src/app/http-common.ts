import { HttpHeaders } from '@angular/common/http';

// The only place with the address of the Web API. Every service imports it from here.
export const baseUrl = 'http://localhost:5050/api';

// The data between the Angular app and the API is JSON.
export const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
