import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {SharedService} from '../../../../services/shared/shared.service';
import {Student} from 'src/app/models/ecoe';

/**
 * Component with students.
 */
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
              private shared: SharedService) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadStudents();
  }

  /**
   * Load students by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadStudents() {
    Student.query({
      where: {ecoe: this.ecoeId},
      sort: {surnames: false, name: false}
    }).then(response => {
      this.editCache = {};
      this.students = response;
      this.updateEditCache();
    });
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStudents]{@link #updateArrayStudents} function.
   *
   * @param {any} student Resource selected
   */
  deleteItem(student: any) {
    this.apiService.deleteResource(student['$uri']).subscribe(() => {
      this.updateArrayStudents(student.id);
    });
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param {number} id Id of the selected resource
   */
  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayStudents]{@link #updateArrayStudents} function.
   * Else resets editCache to the previous value.
   *
   * @param {any} student Resource selected
   */
  cancelEdit(student: any): void {
    this.editCache[student.id].edit = false;

    if (this.editCache[student.id].new_item) {
      this.updateArrayStudents(student.id);
    } else {
      this.editCache[student.id] = student;
    }
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param {any} student Resource selected
   * @param {boolean} newItem determines if the resource is already saved
   */
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

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  addStudent() {
    this.apiService.getResources('student')
      .subscribe(students => {
        this.index += this.shared.getLastIndex(students);

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

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.students.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param {number} studentId Id of the resource passed
   */
  updateArrayStudents(studentId: number) {
    delete this.editCache[studentId];
    this.students = this.students.filter(x => x.id !== studentId);
  }
}
