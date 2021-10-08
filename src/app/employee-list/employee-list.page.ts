import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  styleUrls: ['./employee-list.page.scss'],
})
export class EmployeeListPage implements OnInit {
  databaseObj: SQLiteObject;
  row_data: any = [];
  readonly table_name: string = "employee";
  readonly database_name: string = "employee_records.db";
  constructor(public sqlite: SQLite,public alertController: AlertController, public toastController: ToastController) { }

  ngOnInit() {
  }
async ionViewWillEnter(){
  await this.createDB();

}
async createDB() {
  const conn =  this.sqlite.create({
     name: this.database_name,
     location: 'default'
   })
   .then((db: SQLiteObject) => {
       this.databaseObj = db;
      //  alert('freaky_datatable Database Created!');
       this.getRows();
     })
     .catch(e => {
      //  alert("error " + JSON.stringify(e))
     });
 }
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
  deleteRow(item) {
    this.databaseObj.executeSql(`
      DELETE FROM ${this.table_name} WHERE pid = ${item.pid}
    `
      , [])
      .then((res) => {
        this.presentToastSuccess("Infromation deleted successfully");
        this.getRows();
      })
      .catch(e => {
        this.presentToastError("Something went wrong, please try again later");
        // alert("error " + JSON.stringify(e))
      });
  }
  async presentAlertConfirm(item) {
    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Are you Sure!',
      message: 'You want to delete this record',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.deleteRow(item);
          }
        }
      ]
    });

    await alert.present();
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
