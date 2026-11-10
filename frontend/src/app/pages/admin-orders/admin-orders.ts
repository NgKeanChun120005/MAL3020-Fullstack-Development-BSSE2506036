import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../../services/socket.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

interface AdminOrder {
  _id: string;
  customerId: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-orders.html'
})
export class AdminOrders implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private socket = inject(SocketService);
  private apiUrl = `${environment.apiUrl}/api/orders`;

  orders = signal<AdminOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private statusSub?: Subscription;

  ngOnInit(): void {
    this.loadOrders();

    // Live update if kitchen changes a status
    this.statusSub = this.socket.onOrderStatus().subscribe({
      next: (update) => {
        this.orders.update((orders) =>
          orders.map((o) => (o._id === update._id ? { ...o, status: update.status as any } : o))
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }

  loadOrders(): void {
    this.http.get<AdminOrder[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.orders.set(data.reverse()); // newest first
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load orders');
        this.loading.set(false);
      }
    });
  }
}