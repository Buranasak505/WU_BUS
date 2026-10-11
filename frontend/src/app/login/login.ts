import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class Login {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post('https://wu-bus-backend.onrender.com/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const token = response.token || response.access_token;
        if (token) {
          localStorage.setItem('adminToken', token);
        }
        this.cdr.detectChanges();
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Login error', err);
        this.isLoading = false;
        this.errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง';
        this.cdr.detectChanges();
      }
    });
  }
}
