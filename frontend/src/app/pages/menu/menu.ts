import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MenuService, MenuItem } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class Menu implements OnInit {
  private menuService = inject(MenuService);
  cart = inject(CartService);
  auth = inject(AuthService);
  
  items = signal<MenuItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  justAdded = signal<string | null>(null);
  
  selectedCategory = signal<string>('all');
  categories = ['all', 'mains', 'sides', 'drinks', 'desserts'];

  grouped = computed(() => {
    let itemsToGroup = this.items();
    
    // 1. Filter by category if not 'all'
    if (this.selectedCategory() !== 'all') {
      itemsToGroup = itemsToGroup.filter(i => i.category === this.selectedCategory());
    }

    // 2. Group the filtered items
    const map = new Map<string, MenuItem[]>();
    for (const item of itemsToGroup) {
      const bucket = map.get(item.category) ?? [];
      bucket.push(item);
      map.set(item.category, bucket);
    }
    
    // 3. Return sorted
    return Array.from(map.entries())
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  ngOnInit(): void {
    this.menuService.list().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load menu');
        this.loading.set(false);
      }
    });
  }

  addToCart(item: MenuItem): void {
    this.cart.add(item);
    this.justAdded.set(item._id);
    setTimeout(() => {
      if (this.justAdded() === item._id) this.justAdded.set(null);
    }, 1000);
  }
}