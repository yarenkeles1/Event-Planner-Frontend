import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  
  fullName = signal<string>('');
  email = signal<string>('');
  
  createdEventsCount = signal<number>(5);
  joinedEventsCount = signal<number>(3);

  ngOnInit() {
    this.fullName.set(sessionStorage.getItem('fullName') || 'Kullanıcı Bilgisi Yok');
    this.email.set(sessionStorage.getItem('email') || 'Email Bilgisi Yok');
  }
}