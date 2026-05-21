import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IEvent } from '../../models/IEvent';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-events',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-events.html',
  styleUrls: ['./my-events.css'],
})
export class MyEvents implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  events = signal<IEvent[]>([]);
  loading = signal<boolean>(false);
  activeEventId = signal<number | null>(null);
  participants = signal<any[]>([]);

  currentPage = signal<number>(0);
  totalPages = signal<number>(1);
  pageSize = signal<number>(6); 

  ngOnInit() {
    this.loadMyEvents(0); 
  }

  loadMyEvents(page: number) {
    this.loading.set(true);
    this.http.get<any>(`http://localhost:8081/event/myEvents?page=${page}&size=${this.pageSize()}`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.events.set(response.content);
        this.currentPage.set(response.number); 
        this.totalPages.set(response.totalPages); 
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.loadMyEvents(page);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Yayında',
      PAUSED: 'Durduruldu',
      ARCHIVED: 'Arşivlendi'
    };
    return map[status] ?? status;
  }

  goEdit(id: number | undefined) {
    if (id) {
      this.router.navigate(['/event-edit', id]);
    }
  }

  deleteEvent(id: number | undefined) {
    if (!id) return;
    
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:8081/event/deleteOne/${id}`, { withCredentials: true }).subscribe({
          next: () => {
            this.loadMyEvents(this.currentPage()); 
            Swal.fire({
              toast: true, position: 'top-end', icon: 'success',
              title: 'Etkinlik başarıyla silindi!', showConfirmButton: false, timer: 3000, timerProgressBar: true
            });
          },
          error: (e) => {
             Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: e.error?.message || 'Silme işlemi sırasında hata oluştu', showConfirmButton: false, timer: 3000
             });
          }
        });
      }
    });
  }

  changeStatus(id: number | undefined, action: 'publish' | 'pause' | 'archive') {
    if (!id) return;
    
    this.http.patch(`http://localhost:8081/event/${action}/${id}`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.events.update(currentEvents => currentEvents.map(event => {
          if (event.id === id) {
            const newStatusMap = { 'publish': 'ACTIVE', 'pause': 'PAUSED', 'archive': 'ARCHIVED' };
            return { ...event, status: newStatusMap[action] };
          }
          return event;
        }));
        
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: 'Durum güncellendi', showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
      },
      error: (e) => {
         Swal.fire({
            toast: true, position: 'top-end', icon: 'error',
            title: e.error?.message || 'Durum güncellenirken hata oluştu', showConfirmButton: false, timer: 3000
         });
      }
    });
  }

  toggleParticipants(eventId: number | undefined) {
    if (!eventId) return;

    if (this.activeEventId() === eventId) {
      this.activeEventId.set(null);
      this.participants.set([]);
      return;
    }

    this.http.get<any[]>(`http://localhost:8081/participation/list/${eventId}`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.activeEventId.set(eventId);
        this.participants.set(response);
      },
      error: (err) => {
          Swal.fire({
              toast: true, position: 'top-end', icon: 'error',
              title: 'Katılımcı listesi yüklenirken bir hata oluştu.', showConfirmButton: false, timer: 3000
          });
      }
    });
  }
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}