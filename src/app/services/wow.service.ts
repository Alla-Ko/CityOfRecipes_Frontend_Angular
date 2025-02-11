import { Injectable } from '@angular/core';
declare var WOW: any; // Декларація для WOW.js

@Injectable({
  providedIn: 'root',
})
export class WowService {
  constructor() {}

  initWow() {
    new WOW().init(); // Ініціалізація WOW.js
  }
}
