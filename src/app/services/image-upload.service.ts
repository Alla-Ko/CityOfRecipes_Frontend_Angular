import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  private apiUrl = 'https://localhost:7186/api/ImageUpload/upload';  // Заміни на URL твого API для завантаження

  constructor(private http: HttpClient,private userService:UserService) { }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
		
    formData.append('file', file, file.name);

    // Якщо API вимагає додаткових заголовків, можна додати їх
		const token=this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Додаємо токен у заголовок
    });


    return this.http.post(this.apiUrl, formData, { headers });
  }
}
