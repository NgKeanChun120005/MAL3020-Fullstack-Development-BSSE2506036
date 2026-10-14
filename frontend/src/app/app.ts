import { Component, OnInit, signal } from '@angular/core';
import { HealthService } from './services/health.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Takeaway Ordering System</h1>
    <p>Backend: {{ status() }}</p>
  `
})
export class App implements OnInit {
  status = signal('...');

  constructor(private health: HealthService) {}

  ngOnInit() {
    this.health.check().subscribe({
      next: (r) => this.status.set(r.status),
      error: () => this.status.set('unreachable')
    });
  }
}