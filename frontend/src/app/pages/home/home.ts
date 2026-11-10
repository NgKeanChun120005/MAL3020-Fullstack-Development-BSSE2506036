import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  auth = inject(AuthService);
  cart = inject(CartService);

  // Get the user's first name for greeting
  firstName = computed(() => {
    const name = this.auth.user()?.name ?? 'Guest';
    return name.split(' ')[0];
  });
}