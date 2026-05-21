import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);

  isLoggedIn = signal<boolean>(false);
  userName = signal<string>('');

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const id = sessionStorage.getItem('id');
    if (id) {
      this.isLoggedIn.set(true);
      this.userName.set(sessionStorage.getItem('fullName') || 'Kullanıcı');
    }
  }

  logout() {
    sessionStorage.clear();
    this.isLoggedIn.set(false);
    this.userName.set('');
    
    this.router.navigate(['/login']);
  }
}