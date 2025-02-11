import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Імпортуємо маршрути
import { appConfig } from './app/app.config'; // Імпортуємо appConfig
import { provideAnimations } from '@angular/platform-browser/animations'; // Імпортуємо анімації
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { AuthInterceptor } from './app/services/auth.interceptor';
registerSwiperElements();
bootstrapApplication(AppComponent, {
  ...appConfig, // Інші налаштування застосунку
  providers: [
    ...appConfig.providers, // Залишаємо існуючих провайдерів
    provideRouter(routes),  // Додаємо маршрути	
    provideAnimations(),
		provideHttpClient(),
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
}).catch((err) => console.error(err));

