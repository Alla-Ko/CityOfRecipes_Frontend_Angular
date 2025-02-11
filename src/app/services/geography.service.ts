import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { Country } from '../models/country.model';
import { City } from '../models/city.model';

@Injectable({
  providedIn: 'root',
})
export class GeographyService {
  
  private ApiUrl = 'https://localhost:7186/api/Countries';

  constructor(private http: HttpClient, private userService: UserService) {}
  getCountries(): Observable<Country[]> {
		const token=this.userService.getToken();
				const headers = new HttpHeaders({
					'Authorization': `Bearer ${token}`, // Додаємо токен у заголовок
				});
    return this.http.get<Country[]>(`${this.ApiUrl}`,{ headers });
  }
  getCities(countryId: string): Observable<City[]> {
		const token=this.userService.getToken();
				const headers = new HttpHeaders({
					'Authorization': `Bearer ${token}`, // Додаємо токен у заголовок
				});
    return this.http.get<City[]>(`${this.ApiUrl}/${countryId}/cities`,{ headers });
  }
	addCity(cityName: string, countryId: string): Observable<City> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json', // Додаємо Content-Type для POST запиту
    });
    const body = { cityName, countryId };
    return this.http.post<City>(`https://localhost:7186/api/cities`, body, { headers });
  }
}
