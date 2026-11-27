import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  token = signal('');
  password = signal('');
  confirmPassword = signal('');
  message = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  
  showPassword = signal(false);
  showConfirm = signal(false);
  
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
  toggleConfirm(): void {
    this.showConfirm.update(v => !v);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      }
    });
  }

  submit(): void {
    if (!this.token() || !this.password()) return;
    
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.message.set(null);

    this.auth.resetPassword(this.token(), this.password()).subscribe({
      next: () => {
        this.message.set('Password reset successfully! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Failed to reset password');
        this.loading.set(false);
      }
    });
  }
}