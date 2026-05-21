import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-edit',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './event-edit.html',
  styleUrls: ['./event-edit.css']
})
export class EventEdit implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  editForm: FormGroup;
  eventId = signal<number | null>(null);
  loading = signal<boolean>(false);

  constructor() {
    this.editForm = this.fb.group({
      id: [null, Validators.required],
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      imageUrl: [''],
      description: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.eventId.set(Number(idParam));
      this.loadEventDetails();
    } else {
      this.router.navigate(['/my-events']);
    }
  }

  loadEventDetails() {
    this.loading.set(true);
    this.http.get(`http://localhost:8081/event/getOne/${this.eventId()}`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.editForm.patchValue(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Etkinlik bilgileri yüklenemedi!',
          showConfirmButton: false,
          timer: 3000
        });
        
        this.router.navigate(['/my-events']);
      }
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.loading.set(true);
      
      const updateData = this.editForm.value;

      this.http.put('http://localhost:8081/event/update', updateData, { withCredentials: true }).subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Etkinlik başarıyla güncellendi!',
            showConfirmButton: false,
            timer: 3000
          });
          
          this.router.navigate(['/my-events']);
        },
        error: (err) => {
          this.loading.set(false);
          
          let errorMsg = 'Güncelleme sırasında beklenmeyen bir hata meydana geldi.';
          
          if (err.status === 400) {
             errorMsg = "Geçmiş bir tarihe etkinlik planlanamaz. Lütfen bugünün veya ileri bir tarihin seçildiğinden emin olun.";
          } else if (err.error && err.error.message) {
             errorMsg = err.error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Güncelleme Başarısız',
            text: errorMsg,
            confirmButtonColor: '#6c63ff',
            confirmButtonText: 'Tamam'
          });
        }
      });
    }
  }
}