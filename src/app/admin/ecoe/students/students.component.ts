import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {SharedService} from '../../../services/shared/shared.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.less']
})
export class StudentsComponent implements OnInit {

  students: any[] = [];
  ecoeId: number;
  editCache = {};
  index: number = 1;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadStudents();
  }

  loadStudents() {
    this.apiService.getResources('student', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(response => {
      this.editCache = {};
      this.students = response;
      this.updateEditCache();
    });
  }

  deleteItem(student: any) {
    this.apiService.deleteResource(student['$uri']).subscribe(() => {
      this.updateArrayStudents(student.id);
    });
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(student: any): void {
    this.editCache[student.id].edit = false;

    if (this.editCache[student.id].new_item) {
      this.updateArrayStudents(student.id);
    } else {
      this.editCache[student.id] = student;
    }
  }

  saveItem(student: any, newItem: boolean) {
    const item = this.editCache[student.id];

    if (!item.dni || !item.surnames || !item.name) {
      return;
    }

    const body = {
      dni: item.dni,
      surnames: item.surnames,
      name: item.name,
      ecoe: this.ecoeId
    };

    const request = (
      newItem ?
        this.apiService.createResource('student', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCache[student.id];
      delete this.editCache[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        ...response
      };

      this.students = this.students.map(x => (x.id === student.id) ? response : x);
    });
  }

  addStudent() {
    this.apiService.getResources('student')
      .subscribe(students => {
        this.index += this.sharedService.getLastIndex(students);

        const newItem = {
          id: this.index,
          dni: '',
          surnames: '',
          name: '',
          ecoe: this.ecoeId
        };

        this.students = [...this.students, newItem];

        this.editCache[this.index] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  updateEditCache(): void {
    this.students.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  updateArrayStudents(studentId: number) {
    delete this.editCache[studentId];
    this.students = this.students.filter(x => x.id !== studentId);
  }
}
