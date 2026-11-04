import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart {
  cart = inject(CartService);
  private router = inject(Router);

  changeQty(menuItemId: string, delta: number): void {
    const line = this.cart.lines().find((l) => l.menuItemId === menuItemId);
    if (!line) return;
    this.cart.updateQty(menuItemId, line.qty + delta);
  }

  remove(menuItemId: string): void {
    this.cart.remove(menuItemId);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}