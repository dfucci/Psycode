// tslint:disable-next-line:no-var-requires
const electron = require('electron');
const { ipcRenderer } = electron;
class Subject {
  private ID: string;
  private answers: boolean[];

  constructor(ID: string) {
    this.ID = ID;
    this.answers = [];
  }
}

function createSubject(e: any): void {
  e.preventDefault();
  const id = document.querySelector('#subjectID') as HTMLInputElement;
  const s = new Subject(id.value);
  console.log(s);
  ipcRenderer.send('subject:create', s);
}
