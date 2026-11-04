import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.css']
})
export class MyOrders implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private socket = inject(SocketService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  recentlyUpdated = signal<Set<string>>(new Set());

  private statusSub?: Subscription;

  ngOnInit(): void {
    this.refresh();
    this.subscribeToStatusUpdates();
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
    for (const order of this.orders()) {
      this.socket.leaveOrder(order._id);
    }
  }

  refresh(): void {
    this.orderService.listMine().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);

        // Join the room for each order so status updates arrive
        for (const order of data) {
          this.socket.joinOrder(order._id);
        }
      },
      error: () => {
        this.error.set('Could not load orders');
        this.loading.set(false);
      }
    });
  }

  private subscribeToStatusUpdates(): void {
    this.statusSub = this.socket.onOrderStatus().subscribe({
      next: (update) => {
        this.orders.update((orders) =>
          orders.map((o) =>
            o._id === update._id
              ? { ...o, status: update.status as Order['status'], updatedAt: update.updatedAt }
              : o
          )
        );

        // Briefly highlight the updated order
        this.recentlyUpdated.update((s) => new Set(s).add(update._id));
        setTimeout(() => {
          this.recentlyUpdated.update((s) => {
            const next = new Set(s);
            next.delete(update._id);
            return next;
          });
        }, 2000);
      }
    });
  }
}