import { HttpHeaders } from '@angular/common/http';

// The only place with the address of the Web API.
export const baseUrl = 'http://localhost:5050/api';

export const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
