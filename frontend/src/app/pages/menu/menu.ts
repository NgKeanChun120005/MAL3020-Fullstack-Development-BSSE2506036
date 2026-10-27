import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './menu.html'
})
export class Menu implements OnInit {
  private menuService = inject(MenuService);

  items = signal<MenuItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  grouped = computed(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of this.items()) {
      // Fetch the existing array for this category, or fall back to a fresh empty array if it doesn't exist yet
      const bucket = map.get(item.category) ?? [];
      // Add the current item to the category's array
      bucket.push(item);
      // Save the updated array back into the map under its specific category name
      map.set(item.category, bucket);
    }
    return Array.from(map.entries())
      .map(([category, items]) => ({ category, items }))
        // Alphabetically sort the final array based on the category names
      .sort((a, b) => a.category.localeCompare(b.category));
  });

    // The lifecycle hook that triggers automatically immediately after the component is initialized
  ngOnInit(): void {
    this.menuService.list().subscribe({
      // Executes successfully when data arrives from the stream
      next: (data) => {
        this.items.set(data); // Update the 'items' signal with the newly fetched menu data
        this.loading.set(false); // Turn off the loading indicator signal since the data arrived
      },
      // Executes if the API network request fails
      error: () => {
        this.error.set('Could not load menu'); // Assign string message to the error signal
        this.loading.set(false);  // Turn off the loading indicator signal
      }
    });
  }
}