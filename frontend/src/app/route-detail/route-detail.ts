import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { interval, startWith, switchMap, Subscription } from 'rxjs';

@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-detail.html'
})
export class RouteDetail implements OnInit, OnDestroy {
  routeData: any = null;
  isLoading: boolean = true;
  error: string | null = null;

  live = signal<any>(null);
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const routeNumber = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('number');

    if (routeNumber) {
      this.fetchRouteDetail(routeNumber);
      this.startLive(routeNumber);
    }
  }

  fetchRouteDetail(number: string): void {
    this.isLoading = true;
    this.error = null;

    // เปลี่ยนลิงก์จุดที่ 1
    this.http.get(`https://wu-bus-backend.onrender.com/routes/${number}`).subscribe({
      next: (data) => {
        this.routeData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching route details', err);
        this.error = 'ไม่สามารถดึงข้อมูลเส้นทางได้';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startLive(num: string): void {
    this.sub?.unsubscribe();
    this.sub = interval(15000)
      .pipe(
        startWith(0),
        // เปลี่ยนลิงก์จุดที่ 2
        switchMap(() => this.http.get<any>(`https://wu-bus-backend.onrender.com/routes/${num}/live`))
      )
      .subscribe({
        next: (d) => {
          this.live.set(d);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching live data', err)
      });
  }

  getLive(stopId: number) {
    return this.live()?.stops?.find((s: any) => s.id === stopId);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}