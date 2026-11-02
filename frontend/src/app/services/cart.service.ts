import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from './menu.service';

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

const STORAGE_KEY = 'takeaway_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _lines = signal<CartLine[]>(this.loadFromStorage());

  readonly lines = this._lines.asReadonly();
  readonly count = computed(() => this._lines().reduce((s, l) => s + l.qty, 0));
  readonly total = computed(() =>
    Number(this._lines().reduce((s, l) => s + l.price * l.qty, 0).toFixed(2))
  );
  readonly isEmpty = computed(() => this._lines().length === 0);

  add(item: MenuItem, qty = 1): void {
    const existing = this._lines().find((l) => l.menuItemId === item._id);
    if (existing) {
      this.updateQty(item._id, existing.qty + qty);
      return;
    }
    this._lines.update((lines) => [
      ...lines,
      { menuItemId: item._id, name: item.name, price: item.price, qty }
    ]);
    this.persist();
  }

  updateQty(menuItemId: string, qty: number): void {
    if (qty <= 0) {
      this.remove(menuItemId);
      return;
    }
    this._lines.update((lines) =>
      lines.map((l) => (l.menuItemId === menuItemId ? { ...l, qty } : l))
    );
    this.persist();
  }

  remove(menuItemId: string): void {
    this._lines.update((lines) => lines.filter((l) => l.menuItemId !== menuItemId));
    this.persist();
  }

  clear(): void {
    this._lines.set([]);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._lines()));
  }

  private loadFromStorage(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  }
}