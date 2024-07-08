import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  constructor() { }
  private checkStudentCapacityFn: () => void;

  registerCheckStudentCapacity(fn: () => void) {
    this.checkStudentCapacityFn = fn;
  }

  checkStudentCapacity() {
    if (this.checkStudentCapacityFn) {
      this.checkStudentCapacityFn();
    }
  }
}
