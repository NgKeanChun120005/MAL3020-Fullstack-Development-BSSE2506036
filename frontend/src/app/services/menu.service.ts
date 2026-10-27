import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'mains' | 'sides' | 'drinks' | 'desserts';
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuItemDraft = Omit<MenuItem, '_id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = 'http://localhost:5000/api/menu';
  private http = inject(HttpClient);

  // Fetches the list of menu items from the server
  list(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  // Sends a request to create and save a new menu item
  create(item: MenuItemDraft): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }

  // Updates the details of an existing menu item by its ID
  update(id: string, item: MenuItemDraft): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item);
  }

  // deletes a specific menu item from the server by its ID
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}