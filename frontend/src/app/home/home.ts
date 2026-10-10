import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouteService } from '../route.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './home.html'
})
export class Home implements OnInit {
  routes: any[] = [];
  searchText: string = '';
  selectedColor: string = '';
  
  isLoading: boolean = false;
  hasError: boolean = false;

  constructor(
    private routeService: RouteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRoutes();
  }

  fetchRoutes(): void {
    this.isLoading = true;
    this.hasError = false;

    this.routeService.getRoutes(this.searchText, this.selectedColor).subscribe({
      next: (data) => {
        this.routes = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // <--- บังคับให้หน้าเว็บอัปเดตข้อมูลทันที
      },
      error: (err) => {
        console.error('Error fetching routes', err);
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges(); // <--- บังคับให้อัปเดตหน้าจอตอนเกิด Error ด้วย
      }
    });
  }

  onSearch(event: any): void {
    this.searchText = event.target.value;
    this.fetchRoutes(); 
  }

  filterColor(color: string): void {
    this.selectedColor = color;
    this.fetchRoutes(); 
  }
}