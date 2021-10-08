import { Component } from '@angular/core';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { NavController, Platform, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  databaseObj: SQLiteObject;
  name_model: string = "";
  Email: string = "";
  Company: string = "";
  row_data: any = [];
  empForm: FormGroup;
  Mobile: Number;
  validation_messages = {
   'name': [
     { type: 'required', message: 'Name is required.' },
     { type: 'pattern', message: 'Your name must contain only letters.' },

   ]
  }
  date_time: any = moment(new Date()).format("DD-MM-YYYY HH:mm:ss");

  readonly database_name: string = "employee_records.db";
  readonly table_name: string = "employee";

  // Handle Update Row Operation
  updateActive: boolean;
  to_update_item: any;

  constructor(
    private platform: Platform,
    public sqlite: SQLite,
    public nav: NavController,
    public toastController: ToastController,private frmBuilder: FormBuilder
  ) {
    this.platform.ready().then(() => {
      console.log('date_time :', this.date_time);
      this.createDB();
    }).catch(error => {
      console.log(error);
    })
  }
 async ionViewWillEnter(){
   await this.createForm();
   await this.createDB();
  await this.createTable();
  this.getRows();

  }
  // Create DB if not there
  async createDB() {
   const conn =  this.sqlite.create({
      name: this.database_name,
      location: 'default'
    })
    .then((db: SQLiteObject) => {
        this.databaseObj = db;
        // alert('employee_record Database Created!');
      })
      .catch(e => {
        // alert("error " + JSON.stringify(e))
      });
  }

  // Create table
  createTable() {
    this.databaseObj.executeSql(`
    CREATE TABLE IF NOT EXISTS ${this.table_name}  (pid INTEGER PRIMARY KEY, Name varchar(255) , Email varchar(128) , Mobile varchar(12) , Company varchar(64), date_time varchar(128))`, [])
      .then(() => {
        // alert('Table Created!');
      })
      .catch(e => {
      console.log('e :', e);

        // alert("error " + JSON.stringify(e))
      });
  }

  //Inset row in the table
  insertRow() {
    // Value should not be empty
    // if (!this.name_model.length) {
    //   alert("Enter Name");
    //   return;
    // }

    this.databaseObj.executeSql(`
      INSERT INTO ${this.table_name} (Name,Email,Mobile,Company,date_time) VALUES ('${this.name_model}','${this.Email}','${this.Mobile}','${this.Company}','${this.date_time}')
    `, [])
      .then(() => {
        this.presentToastSuccess("Information Saved Successfully")
        this.getRows();
      })
      .catch(e => {
        this.presentToastError("Something went wrong, please try again later")
        // alert("error " + JSON.stringify(e))
      });
  }
  createForm() {
    this.empForm = this.frmBuilder.group({
      name_model: ['',Validators.compose([
        Validators.pattern('^[a-zA-Z ]*$'),
        Validators.required
      ]) ],
       Email:['',[Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/)]],
       Company: ['', Validators.required ],
       date_time: [null],
      //  date_time: [null, Validators.required ],
       Mobile: ['',  [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],

    });
  }

  // Retrieve rows from table
  getRows() {
    this.databaseObj.executeSql(`
    SELECT * FROM ${this.table_name}
    `
      , [])
      .then((res) => {
        this.row_data = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            this.row_data.push(res.rows.item(i));
          }
        }
      })
      .catch(e => {
        // alert("error " + JSON.stringify(e))
      });
  }

  // Delete single row
  deleteRow(item) {
    this.databaseObj.executeSql(`
      DELETE FROM ${this.table_name} WHERE pid = ${item.pid}
    `
      , [])
      .then((res) => {
        // alert("Row Deleted!");
        this.getRows();
      })
      .catch(e => {
        // alert("error " + JSON.stringify(e))
      });
  }

  // Enable update mode and keep row data in a variable
  enableUpdate(item) {
    this.updateActive = true;
    this.to_update_item = item;
    this.name_model = item.Name;
  }

  // Update row with saved row id
  updateRow() {
    this.databaseObj.executeSql(`
      UPDATE ${this.table_name}
      SET Name = '${this.name_model}'
      WHERE pid = ${this.to_update_item.pid}
    `, [])
      .then(() => {
        alert('Row Updated!');
        this.updateActive = false;
        this.getRows();
      })
      .catch(e => {
        alert("error " + JSON.stringify(e))
      });
  }
  viewEmployees()
  {
    this.nav.navigateForward('employee-list')
  }
  async presentToastSuccess(message: any) {
    const toast = await this.toastController.create({
      message,
      duration: 1000,
      position: 'bottom',
      cssClass: 'my-custom-toastSuceess',
    });
    toast.present();
  }
  async presentToastError(message: any) {
    const toast = await this.toastController.create({
      message,
      duration: 1000,
      position: 'bottom',
      cssClass: 'my-custom-toastError',
    });
    toast.present();
  }
}
