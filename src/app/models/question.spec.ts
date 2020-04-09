/*
 * Copyright (c) 2020 Miguel Hernandez University of Elche
 * This file is part of openECOE-WebUI-ng.
 *
 *      openECOE-WebUI-ng is free software: you can redistribute it and/or modify
 *      it under the terms of the GNU General Public License as published by
 *      the Free Software Foundation, either version 3 of the License, or
 *      (at your option) any later version.
 *
 *      openECOE-WebUI-ng is distributed in the hope that it will be useful,
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of
 *      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *      GNU General Public License for more details.
 *
 *      You should have received a copy of the GNU General Public License
 *      along with openECOE-WebUI-ng.  If not, see <https://www.gnu.org/licenses/>.
 */

import {MaxPointsRangeError, Question, QuestionCheckBox, QuestionOption, QuestionRadio, QuestionRange} from '@models/question';
import {Item, ItemCache, POTION_CONFIG, POTION_RESOURCES, PotionBase, PotionModule} from '@openecoe/potion-client';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../environments/environment';
import {resources} from '@app/app.resources';


describe('Test for QuestionSchema extended classes', () => {
  describe('Test for QuestionRadio', () => {
    const questionRadio = new QuestionRadio();
    const questionOption1 = new QuestionOption();
    const questionOption2 = new QuestionOption();

    beforeEach(() => {
      questionRadio.reference = 'ref';
      questionRadio.description = 'desc';
      questionRadio.options = [];

      questionOption1.order = 0;
      questionOption1.id_option = 1;
      questionOption1.label = 'option 1';
      questionOption1.points = 5;

      questionOption2.order = 1;
      questionOption1.id_option = 2;
      questionOption2.label = 'option 2';
      questionOption2.points = 2;
    });

    it('should be defined', () => {
      expect(questionRadio).toBeDefined();
      expect(questionRadio.type).toEqual('radio');
      expect(questionRadio.reference).toEqual('ref');
      expect(questionRadio.description).toEqual('desc');
      expect(questionRadio.maxPoints).toEqual(0, 'should be 0');
    });

    it('can add options', () => {
      questionRadio.options.push(questionOption1, questionOption2);
      expect(questionRadio.options).toBeDefined();
      expect(questionRadio.options.length).toEqual(2);
      expect(questionRadio.maxPoints).toEqual(5, 'max points should be 5');
    });

    it('can remove options', () => {
      questionRadio.options.push(questionOption1, questionOption2);
      questionRadio.options.splice(0, 1);
      expect(questionRadio.options.length).toEqual(1);
      expect(questionRadio.maxPoints).toEqual(2, 'max points should be 2');
    });

    it('max points 0 when all points are negative', () => {
      questionOption1.points = -5;
      questionOption2.points = -2;
      questionRadio.options.push(questionOption1, questionOption2);
      expect(questionRadio.maxPoints).toEqual(0, 'should be 0 because all points are negative');
    });
  });

  describe('Test for QuestionCheckBox', () => {
    const questionCheckBox = new QuestionCheckBox();
    const questionOption1 = new QuestionOption();
    const questionOption2 = new QuestionOption();

    beforeEach(() => {
      questionCheckBox.reference = 'ref';
      questionCheckBox.description = 'desc';
      questionCheckBox.options = [];

      questionOption1.order = 0;
      questionOption1.id_option = 1;
      questionOption1.label = 'option 1';
      questionOption1.points = 5;

      questionOption2.order = 1;
      questionOption1.id_option = 2;
      questionOption2.label = 'option 2';
      questionOption2.points = 2;
    });

    it('should be defined', () => {
      expect(questionCheckBox).toBeDefined();
      expect(questionCheckBox.type).toEqual('checkbox');
      expect(questionCheckBox.reference).toEqual('ref');
      expect(questionCheckBox.description).toEqual('desc');
      expect(questionCheckBox.maxPoints).toEqual(0, 'should be 0');
    });

    it('can add options', () => {
      questionCheckBox.options.push(questionOption1, questionOption2);
      expect(questionCheckBox.options).toBeDefined();
      expect(questionCheckBox.options.length).toEqual(2);
      expect(questionCheckBox.maxPoints).toEqual(7, 'max points should be 7');
    });

    it('can remove options', () => {
      questionCheckBox.options.push(questionOption1, questionOption2);
      questionCheckBox.options.splice(0, 1);
      expect(questionCheckBox.options.length).toEqual(1);
      expect(questionCheckBox.maxPoints).toEqual(2, 'max points should be 2');
    });

    it('max points 0 when all points are negative', () => {
      questionOption1.points = -5;
      questionOption2.points = -2;
      questionCheckBox.options.push(questionOption1, questionOption2);
      expect(questionCheckBox.maxPoints).toEqual(0, 'should be 0 because all points are negative');
    });


  });

  describe('Test for QuestionRange', () => {
    const questionRange = new QuestionRange();

    beforeEach(() => {
      questionRange.reference = 'ref';
      questionRange.description = 'desc';
      questionRange.range = 10;
      questionRange.maxPoints = 7;
    });

    it('should be defined', () => {
      expect(questionRange).toBeDefined();
      expect(questionRange.type).toEqual('range');
      expect(questionRange.reference).toEqual('ref');
      expect(questionRange.description).toEqual('desc');
      expect(questionRange.range).toEqual(10);
      expect(questionRange.maxPoints).toEqual(7, 'should be 7');
    });

    it('max points should be positive number', () => {
      expect(function () {
        questionRange.maxPoints = -2;
      }).toThrow(MaxPointsRangeError);
    });


  });
});

describe('Test for Question', function () {

  describe('Test for Question item', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{
          provide: POTION_CONFIG,
          useValue: {
            host: environment.API_ROUTE,
            prefix: '/api/v1'
          }
        },
          {
            provide: POTION_RESOURCES,
            useValue: resources,
            multi: true
          }],
        imports: [PotionModule]
      });
    });

    // it('fetch question', done => {
    //   Question.fetch(1,)
    //
    //   Question.fetch(1).then((question: Question) => {
    //     const testQuestion = question;
    //     expect(testQuestion instanceof (Question as any)).toBe(true);
    //     done();
    //   });
    // });

    it('question.query()', done => {
      Question.query().then(question => {
        const testQuestion = question;
        expect(testQuestion instanceof (Question as any)).toBe(true);
        done();
      });
    });

  });
});
