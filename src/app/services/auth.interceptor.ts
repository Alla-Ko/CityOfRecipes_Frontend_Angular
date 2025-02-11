import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
		console.log("Ми в інтерсепторі");	
    // Отримуємо токен з локального сховища через AuthService
    const token = this.userService.getToken();
		
    const requiresAuth = req.headers.has('Require-Auth');
		console.log('Запит потребує авторизації: ', requiresAuth);
    if (token && requiresAuth) {
      // Додаємо токен до запиту
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        headers: req.headers.delete('Require-Auth'), // Видаляємо цей заголовок, щоб він не пішов на сервер
      });
    }

    return next.handle(req);
  }
}
