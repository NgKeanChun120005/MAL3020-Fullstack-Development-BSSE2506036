import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  email = signal('');
  message = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

    submit(): void {
    if (!this.email()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.message.set(null);

    this.auth.forgotPassword(this.email()).subscribe({
      next: (res) => {
        this.message.set('Email verified! Redirecting you to set a new password...');
        
        // Redirect automatically, passing the token in the URL
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { 
            queryParams: { token: res.token } 
          });
        }, 1000);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Could not verify email');
        this.loading.set(false);
      }
    });
  }
}