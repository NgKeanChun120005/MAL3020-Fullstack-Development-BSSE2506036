import { Component, inject, signal, OnInit } from '@angular/core';
import { OrderService, Order } from '../../services/order.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  private orderService = inject(OrderService);
  cart = inject(CartService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.orderService.listMine().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load orders');
        this.loading.set(false);
      }
    });
  }
}