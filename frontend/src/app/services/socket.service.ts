import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

const SERVER_URL = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private auth = inject(AuthService);
  private socket: Socket | null = null;

  private ensureConnected(): Socket | null {
    const token = this.auth.getToken();
    if (!token) return null;

    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        auth: { token },
        transports: ['websocket']
      });

      this.socket.on('connect', () => console.log('🔌 Socket connected'));
      this.socket.on('connect_error', (err) =>
        console.warn('Socket error:', err.message)
      );
    }
    return this.socket;
  }

  joinOrder(orderId: string): void {
    this.ensureConnected()?.emit('order:join', orderId);
  }

  leaveOrder(orderId: string): void {
    this.socket?.emit('order:leave', orderId);
  }

  onOrderStatus(): Observable<{ _id: string; status: string; updatedAt: string }> {
    return new Observable((subscriber) => {
      const socket = this.ensureConnected();
      if (!socket) {
        subscriber.error(new Error('Not authenticated'));
        return;
      }
      const handler = (payload: any) => subscriber.next(payload);
      socket.on('order:status', handler);
      return () => socket.off('order:status', handler);
    });
  }
  
  onNewOrder(): Observable<any> {
    return new Observable((subscriber) => {
      const socket = this.ensureConnected();
      if (!socket) {
        subscriber.error(new Error('Not authenticated'));
        return;
      }
      const handler = (payload: any) => subscriber.next(payload);
      socket.on('order:new', handler);
      return () => socket.off('order:new', handler);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}