import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem, MenuItemDraft } from '../../services/menu.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-menu.html'
})
export class AdminMenu implements OnInit {
  // Pulls the shared MenuService data layer using Angular's functional injector engine
  private menuService = inject(MenuService);

  items = signal<MenuItem[]>([]);
  error = signal<string | null>(null);
  editingId = signal<string | null>(null);
  saving = signal(false);

  draft: MenuItemDraft = this.emptyDraft();

   // Angular Lifecycle hook executed once upon base configuration initialization
  ngOnInit(): void {
    this.refresh(); // Automatically pull the data index immediately when page initialises
  }

 // Requests the newest collection data list from the backend infrastructure
  refresh(): void {
    this.menuService.list().subscribe({
      next: (data) => this.items.set(data),
      error: () => this.error.set('Failed to load menu')
    });
  }

  // Prepares the form layout configuration parameters to build a brand new record item
  startCreate(): void {
    this.editingId.set(null);
    this.draft = this.emptyDraft();
    this.error.set(null);
  }

  startEdit(item: MenuItem): void {
    this.editingId.set(item._id);
    this.draft = {
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available
    };
    this.error.set(null);
  }

  save(): void {
    this.saving.set(true);
    const editing = this.editingId();
    const obs = editing
      ? this.menuService.update(editing, this.draft)
      : this.menuService.create(this.draft);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.startCreate();
        this.refresh();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.error ?? 'Save failed');
      }
    });
  }

  remove(item: MenuItem): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.menuService.remove(item._id).subscribe({
      next: () => this.refresh(),
      error: () => this.error.set('Delete failed')
    });
  }

  private emptyDraft(): MenuItemDraft {
    return { name: '', description: '', price: 0, category: 'mains', available: true };
  }
}