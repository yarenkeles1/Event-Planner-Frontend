import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private http = inject(HttpClient);
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.http.post('http://localhost:8081/users/login', loginData, { withCredentials: true }).subscribe({
        next: (response: any) => {
          const { id, fullName, email } = response as any;
          sessionStorage.setItem('id', response.id);
          sessionStorage.setItem('fullName', response.fullName);
          sessionStorage.setItem('email', email);
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Hoş geldin, ${fullName}!`,
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            window.location.href = '/events';
          });
        },
        error: (err) => {
          let errorMsg = 'Giriş işlemi sırasında bir hata oluştu.';

          if (err.status === 401 || err.status === 404 || (err.error?.message && err.error.message.toLowerCase().includes('invalid'))) {
            errorMsg = 'Giriş bilgileri hatalı. Lütfen e-posta adresinizi ve şifrenizi kontrol ederek tekrar deneyiniz.';
          } else if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Giriş Başarısız',
            text: errorMsg,
            confirmButtonColor: '#6c63ff',
            confirmButtonText: 'Tamam'
          });
        }
      });
    }
  }
}