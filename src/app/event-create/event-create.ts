import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-create',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './event-create.html',
  styleUrls: ['./event-create.css'],
})
export class EventCreate {
  private http = inject(HttpClient);
  private router = inject(Router);
  eventForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      imageUrl: [''],
    });
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched(); 
      return; 
    }

    this.http.post('http://localhost:8081/event/save', this.eventForm.value, { withCredentials: true }).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Etkinlik başarıyla oluşturuldu!',
          showConfirmButton: false,
          timer: 3000
        });
        this.router.navigate(['/my-events']);
      },
      error: (err) => {
        let errorMsg = 'Etkinlik oluşturulurken beklenmeyen bir hata meydana geldi.';
        if (err.status === 400) {
           errorMsg = "Geçmiş bir tarihe etkinlik planlanamaz. Lütfen bugünün veya ileri bir tarihin seçildiğinden emin olun.";
        } else if (err.error && err.error.message) {
           errorMsg = err.error.message;
        }
        Swal.fire({
          icon: 'error',
          title: 'Oluşturma Başarısız',
          text: errorMsg,
          confirmButtonColor: '#6c63ff',
          confirmButtonText: 'Tamam'
        });
      }
    });
  }
  }
