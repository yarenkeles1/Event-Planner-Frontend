import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IEvent } from '../../models/IEvent';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-joined-events',
  imports: [CommonModule, RouterModule],
  templateUrl: './joined-events.html',
  styleUrls: ['./joined-events.css']
})
export class JoinedEvents implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Katıldığın etkinlikleri tutacak signal
  events = signal<IEvent[]>([]);
  loading = signal<boolean>(false);

  // YENİ: SAYFALAMA (PAGINATION) SİNYALLERİ
  currentPage = signal<number>(0);
  totalPages = signal<number>(1);
  pageSize = signal<number>(9); // Sayfa başına etkinlik sayısı (İstersen değiştirebilirsin)

  ngOnInit() {
    this.loadJoinedEvents(0); // İlk açılışta 0. sayfayı yükle
  }

  // YENİ: Sayfa numarasını parametre olarak alıyoruz
  loadJoinedEvents(page: number) {
    this.loading.set(true);
    
    // YENİ: URL'ye page ve size parametrelerini ekledik
    this.http.get<any>(`http://localhost:8081/participation/my-joined?page=${page}&size=${this.pageSize()}`, { withCredentials: true }).subscribe({
      next: (response) => {
        // Spring Boot'tan gelen Page objesinin içini sinyallerimize dolduruyoruz
        this.events.set(response.content);
        this.currentPage.set(response.number);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        
        // Standart, şık Toast hata bildirimi
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

  // YENİ: Sayfa değiştirme fonksiyonu
  changePage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.loadJoinedEvents(page);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Tıklayınca sayfanın en üstüne yumuşakça kayar
    }
  }

  // YENİ: HTML'deki for döngüsü için dizi oluşturan fonksiyon
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  // Kartın üstüne tıklayınca detay sayfasına gitmesi için
  goDetail(id: number | undefined) {
    if (id) {
      this.router.navigate(['/event-detail', id]);
    }
  }
}