import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private http = inject(HttpClient);
  registerForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      
      this.http.post('http://localhost:8081/users/register', registerData, { withCredentials: true }).subscribe({
        next: (response) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            window.location.href = '/login';
          });
        },
        error: (err) => {
          let errorMsg = 'Kayıt işlemi sırasında beklenmeyen bir hata oluştu.';
          const backendMsg = err?.error?.message || err?.error;

          if (err.status === 409 || (typeof backendMsg === 'string' && (backendMsg.toLowerCase().includes('already') || backendMsg.toLowerCase().includes('exists')))) {
            errorMsg = 'Girilen e-posta adresi zaten kayıtlıdır. Lütfen giriş yapın veya farklı bir e-posta adresi deneyin.';
          } else if (typeof backendMsg === 'string') {
            errorMsg = backendMsg;
          }

          Swal.fire({
            icon: 'error',
            title: 'İşleminiz gerçekleştirilemedi. Lütfen tekrar deneyiniz.',
            text: errorMsg,
            confirmButtonColor: '#6c63ff',
            confirmButtonText: 'Tamam'
          });
        }
      });
    }
  }
}