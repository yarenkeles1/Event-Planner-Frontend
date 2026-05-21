import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { IEvent, IEventPage } from '../../models/IEvent';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-list',
  imports: [RouterModule, CommonModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css'],
})
export class EventList {
  private http = inject(HttpClient);
  eventArray = signal<IEvent[]>([]);
  pages = signal<number[]>([]);
  activePage = signal<number>(0);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');

  ngOnInit() {
    this.loadEvents(0);
  }

  loadEvents(page: number = 0) {
    this.activePage.set(page);
    this.loading.set(true);
    const q = this.searchQuery();
    const url = q
      ? `http://localhost:8081/event/search?q=${q}&page=${page}`
      : `http://localhost:8081/event/list?page=${page}`;

    this.http.get<IEventPage>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.eventArray.set(response.content);
        const pagesArray = Array.from({ length: response.totalPages }, (_, i) => i);
        this.pages.set(pagesArray);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: err.error?.message || 'Etkinlikler yüklenirken bir hata oluştu.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  onSearch(event: any) {
    this.searchQuery.set(event.target.value);
    this.loadEvents(0);
  }
}