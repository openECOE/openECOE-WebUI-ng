import { Injectable } from '@angular/core';
import {Shift} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  constructor() { }

  setSelectedRound(roundId: number, ecoeId: number) {
    sessionStorage.setItem('selectedRound', JSON.stringify({
      ecoeId: ecoeId,
      selectedRound: roundId
    }));
  }

  getSelectedRound(ecoeId: number) {
    let selectedRoundId = -1;
    if (sessionStorage.getItem('selectedRound')) {
      const json = JSON.parse(sessionStorage.getItem('selectedRound'));
      if (json['ecoeId'] && json['ecoeId'] === ecoeId) {
        selectedRoundId = parseInt(json['selectedRound'], 10);
      }
    }
    return selectedRoundId;
  }

  getSelectedShift(ecoeId: number) {
    let selectedShiftId = -1;
    if (sessionStorage.getItem('selectedShift')) {
      const json = JSON.parse(sessionStorage.getItem('selectedShift'));
      if (json['ecoeId'] && json['ecoeId'] === ecoeId) {
        selectedShiftId = parseInt(json['selectedShift'], 10);
      }
    }
    return selectedShiftId;
  }

  setSelectedShift(shift: Shift, ecoeId: number) {
    if (shift && shift.id) {
      sessionStorage.setItem('selectedShift', JSON.stringify( {
        ecoeId: ecoeId,
        selectedShift: shift.id
      }));
    }
  }
}


