import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartLine } from './cart.service';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  _id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    // The base URL for the orders API endpoint
  private apiUrl = 'http://localhost:5000/api/orders';
  private http = inject(HttpClient);

  // Sends a POST request to the server to place a new order with the provided payload
    placeOrder(payload: { items: CartLine[]; notes: string }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, payload);
  }

  // Sends a GET request to the server to retrieve all orders for the currently logged-in user
  listMine(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mine`);
  }

  // Sends a GET request to the server to retrieve a specific order by its ID
  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
}