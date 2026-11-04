import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

interface KitchenOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

interface KitchenOrder {
  _id: string;
  customerId: string;
  items: KitchenOrderItem[];
  total: number;
  status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FLOW: Record<string, { next: string; label: string } | null> = {
  placed: { next: 'preparing', label: 'Start Preparing' },
  preparing: { next: 'ready', label: 'Mark Ready' },
  ready: { next: 'completed', label: 'Complete' },
  completed: null,
  cancelled: null
};

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './kitchen.html',
  styleUrls: ['./kitchen.css']
})
export class Kitchen implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private socket = inject(SocketService);
  private apiUrl = 'http://localhost:5000/api/orders';

  orders = signal<KitchenOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  recentlyUpdated = signal<Set<string>>(new Set());

  // Only show orders that still need attention
  activeOrders = computed(() =>
    this.orders().filter((o) => o.status === 'placed' || o.status === 'preparing' || o.status === 'ready')
  );

  // Only show orders that are completed or cancelled
  private newOrderSub?: Subscription;
  private statusSub?: Subscription;

  ngOnInit(): void {
    this.loadOrders();
    this.subscribeToNewOrders();
    this.subscribeToStatusUpdates();
  }

  ngOnDestroy(): void {
    this.newOrderSub?.unsubscribe();
    this.statusSub?.unsubscribe();
  }

  loadOrders(): void {
    this.http.get<KitchenOrder[]>(this.apiUrl).subscribe({
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

  advance(order: KitchenOrder): void {
    const flow = STATUS_FLOW[order.status];
    if (!flow) return;

    this.http
      .patch(`${this.apiUrl}/${order._id}/status`, { status: flow.next })
      .subscribe({
        next: () => {
          // the socket event will also update, but doing it here means the UI responds instantly even if the socket lags
          this.applyStatus(order._id, flow.next);
          this.flashUpdated(order._id);
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Failed to update status');
        }
      });
  }

  private applyStatus(orderId: string, status: string): void {
    this.orders.update((orders) =>
      orders.map((o) =>
        o._id === orderId ? { ...o, status: status as KitchenOrder['status'] } : o
      )
    );
  }

  private flashUpdated(orderId: string): void {
    this.recentlyUpdated.update((s) => new Set(s).add(orderId));
    setTimeout(() => {
      this.recentlyUpdated.update((s) => {
        const next = new Set(s);
        next.delete(orderId);
        return next;
      });
    }, 1500);
  }

  private subscribeToNewOrders(): void {
    this.newOrderSub = this.socket.onNewOrder().subscribe({
      next: (order) => {
        // Guard against duplicates (HTTP response might have already added it)
        if (this.orders().some((o) => o._id === order._id)) return;
        this.orders.update((orders) => [order, ...orders]);
        this.flashUpdated(order._id);
      }
    });
  }

  private subscribeToStatusUpdates(): void {
    this.statusSub = this.socket.onOrderStatus().subscribe({
      next: (update) => {
        this.applyStatus(update._id, update.status);
      }
    });
  }

  nextLabel(status: string): string {
    return STATUS_FLOW[status]?.label ?? '';
  }

  hasNext(status: string): boolean {
    return STATUS_FLOW[status] !== null;
  }
}