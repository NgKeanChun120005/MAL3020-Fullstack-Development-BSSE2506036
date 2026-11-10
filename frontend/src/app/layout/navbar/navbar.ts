import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { SocketService } from '../../services/socket.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  socket = inject(SocketService);
  
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/orders`;

  ngOnInit(): void {
    // If the user is kitchen/admin, fetch the initial active order count
    if (this.auth.isLoggedIn() && (this.auth.role() === 'kitchen' || this.auth.role() === 'admin')) {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (orders) => {
          const activeCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
          this.socket.activeKitchenOrders.set(activeCount);
        },
        error: () => console.error('Failed to load initial order count')
      });
    }
  }
}