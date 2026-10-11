import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'https://wu-bus-backend.onrender.com/routes'; 

  constructor(private http: HttpClient) {}

  getRoutes(search?: string, color?: string): Observable<any[]> {
    let params = new HttpParams();
    
    if (search) {
      params = params.set('search', search);
    }
    if (color) {
      params = params.set('color', color);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }
}