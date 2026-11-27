import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
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
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './admin-orders.html'
})
export class AdminOrders implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private socket = inject(SocketService);
  private apiUrl = `${environment.apiUrl}/api/orders`;

  allOrders = signal<AdminOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = computed(() => Math.ceil(this.allOrders().length / this.pageSize()) || 1);
  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allOrders().slice(start, start + this.pageSize());
  });

  private statusSub?: Subscription;

  ngOnInit(): void {
    this.loadOrders();
    this.statusSub = this.socket.onOrderStatus().subscribe({
      next: (update) => {
        this.allOrders.update((orders) =>
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
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.allOrders.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load orders');
        this.loading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
}
