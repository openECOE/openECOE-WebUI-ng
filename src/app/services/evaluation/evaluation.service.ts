import { Injectable } from '@angular/core';
import {Round} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  constructor() { }

  setSelectedRound(round: Round, ecoeId: number) {
    sessionStorage.setItem('selectedRound', JSON.stringify({
      ecoeId: ecoeId,
      selectedRound: round.id
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
    let selectedShiftId = null;
    if (sessionStorage.getItem('selectedShift')) {
      const json = JSON.parse(sessionStorage.getItem('selectedShift'));
      if (json['ecoeId'] && json['ecoeId'] === ecoeId) {
        selectedShiftId = json['selectedShift'];
      }
    }
    return selectedShiftId;
  }

  setSelectedShift(shift: string, ecoeId: number) {
    if (shift) {
      sessionStorage.setItem('selectedShift', JSON.stringify( {
        ecoeId: ecoeId,
        selectedShift: shift
      }));
    }
  }
}


