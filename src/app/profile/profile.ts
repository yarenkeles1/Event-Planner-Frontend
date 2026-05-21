import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private http = inject(HttpClient); 
  
  fullName = signal<string>('');
  email = signal<string>('');
  
  createdEventsCount = signal<number>(0);
  joinedEventsCount = signal<number>(0);

  ngOnInit() {
    this.fullName.set(sessionStorage.getItem('fullName') || 'Kullanıcı Bilgisi Yok');
    this.email.set(sessionStorage.getItem('email') || 'Email Bilgisi Yok');
    this.fetchEventData();
  }

  fetchEventData() {
    const options = { withCredentials: true };

    this.http.get<any>('http://localhost:8081/event/myEvents', options)
      .subscribe(res => {
        if (res && res.totalElements !== undefined) {
            this.createdEventsCount.set(res.totalElements);
        }
      });

    this.http.get<number>('http://localhost:8081/event/countJoinedEvents', options)
    .subscribe(count => this.joinedEventsCount.set(count));
  }
}