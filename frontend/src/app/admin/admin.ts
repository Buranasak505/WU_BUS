import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <--- เพิ่ม HttpHeaders ตรงนี้
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.html'
})
export class Admin implements OnInit {
  routes: any[] = [];
  isLoading: boolean = true;
  
  showModal: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  
  formData: any = {
    number: null,
    name: '',
    distanceKm: null,
    durationMin: null,
    busCount: null,
    stops: [] 
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRoutes();
  }

  fetchRoutes(): void {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:3000/routes').subscribe({
      next: (data) => {
        this.routes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading routes', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = { number: null, name: '', distanceKm: null, durationMin: null, busCount: null, stops: [] };
    this.showModal = true;
  }

  openEditModal(route: any): void {
    this.isEditMode = true;
    this.formData = JSON.parse(JSON.stringify(route)); 
    if (!this.formData.stops) {
      this.formData.stops = [];
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addStop(): void {
    if (!this.formData.stops) this.formData.stops = [];
    this.formData.stops.push({
      name: '',
      direction: 'INBOUND', 
      order: this.formData.stops.length + 1
    });
  }

  removeStop(index: number): void {
    this.formData.stops.splice(index, 1);
    this.formData.stops.forEach((stop: any, i: number) => {
      stop.order = i + 1;
    });
  }

  saveRoute(): void {
    if (!this.formData.number || !this.formData.name) {
      alert('กรุณากรอก สายรถ และ ชื่อเส้นทาง ให้ครบถ้วน');
      return;
    }

    this.isSaving = true;

    const { id, createdAt, updatedAt, ...cleanData } = this.formData;

    const payload = {
      ...cleanData,
      number: Number(this.formData.number),
      distanceKm: Number(this.formData.distanceKm),
      durationMin: Number(this.formData.durationMin),
      busCount: Number(this.formData.busCount),
      
      color: cleanData.color || '#3b82f6',     
      frequencyMin: cleanData.frequencyMin || 30, 
      firstTrip: cleanData.firstTrip || '07:00',  
      lastTrip: cleanData.lastTrip || '18:00',    
      departureTimes: cleanData.departureTimes || [], 
      active: true
    };

    // 🌟 ดึงบัตรผ่าน (Token) จากเครื่องมาแปะหัวจดหมาย
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (this.isEditMode) {
      // 🌟 ส่ง headers ไปด้วย
      this.http.put(`http://localhost:3000/routes/${this.formData.id}`, payload, { headers }).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.fetchRoutes(); 
        },
        error: (err) => {
          console.error('Update error', err);
          alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.statusText));
          this.isSaving = false;
        }
      });
    } else {
      // 🌟 ส่ง headers ไปด้วย
      this.http.post('http://localhost:3000/routes', payload, { headers }).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.fetchRoutes(); 
        },
        error: (err) => {
          console.error('Create error', err);
          alert('เกิดข้อผิดพลาด: ' + (err.error?.message || err.statusText));
          this.isSaving = false;
        }
      });
    }
  }

  deleteRoute(id: number, name: string): void {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${name} ?`)) {
      
      // 🌟 ดึงบัตรผ่าน (Token) มาใช้ตอนลบด้วย
      const token = localStorage.getItem('adminToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:3000/routes/${id}`, { headers }).subscribe({
        next: () => this.fetchRoutes(),
        error: (err) => alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + (err.error?.message || err.statusText))
      });
    }
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/']);
  }
}