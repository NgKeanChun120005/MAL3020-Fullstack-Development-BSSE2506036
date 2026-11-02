import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './checkout.html'
})
export class Checkout {
  cart = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  notes = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (this.cart.isEmpty()) {
      this.error.set('Your cart is empty');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.orderService
      .placeOrder({
        items: this.cart.lines(),
        notes: this.notes().trim()
      })
      .subscribe({
        next: (order) => {
          this.cart.clear();
          this.router.navigate(['/orders'], { queryParams: { placed: order._id } });
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Could not place order');
          this.submitting.set(false);
        }
      });
  }
}