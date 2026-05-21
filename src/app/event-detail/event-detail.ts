import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IEvent } from '../../models/IEvent';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.css'],
})
export class EventDetail {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  event = signal<IEvent | null>(null);
  loading = signal<boolean>(false);

  isLoggedIn = signal<boolean>(!!sessionStorage.getItem('id'));
  isOwner = signal<boolean>(false);
  isJoined = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loading.set(true);
    this.http.get<IEvent>(`http://localhost:8081/event/getOne/${id}`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.event.set(response);
        const userId = Number(sessionStorage.getItem('id'));
        this.isOwner.set(response.ownerId === userId);
        if (this.isLoggedIn() && !this.isOwner()) {
          this.checkIfJoined(response.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Etkinlik detayları yüklenemedi.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  checkIfJoined(eventId: number | undefined) {
    if (!eventId) return;
    this.http.get<boolean>(`http://localhost:8081/participation/check/${eventId}`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.isJoined.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Yayında',
      PAUSED: 'Durduruldu',
      ARCHIVED: 'Arşivlendi'
    };
    return map[status] ?? status;
  }

  joinEvent() {
    const id = this.event()?.id;
    this.http.post('http://localhost:8081/participation/save',
      { eventId: id }, 
      { withCredentials: true }
      ).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Etkinliğe başarıyla katıldınız!',
          showConfirmButton: false,
          timer: 3000
        });
        
        this.isJoined.set(true);
      },
      error: (e) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: e.error?.message || 'Katılım işlemi sırasında hata oluştu.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }
}