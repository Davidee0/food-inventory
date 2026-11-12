import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, action: string = 'Close') {
    return this.snackBar.open(message, action, { duration: 4000, verticalPosition: 'top' });
  }

  showError(message: string) {
    return this.snackBar.open(message, 'Close', { duration: 5000, verticalPosition: 'top' });
  }
}
