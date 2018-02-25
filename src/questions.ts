// tslint:disable-next-line:no-var-requires
const path = require('path');
const BrowserWindow = electron.remote.BrowserWindow;
enum questionsType {
  Review,
  Prose
}

class Question {
  private correctAnswer: boolean;
  private answer: boolean;
  private questionImage: string;
  private type: questionsType;

  constructor(
    questionImage: string,
    type: questionsType,
    correctAnswer: boolean
  ) {
    this.questionImage = questionImage;
    this.correctAnswer = correctAnswer;
    this.type = type;
  }
}

function createQuestionWindow(e: any): void {
  e.preventDefault();
  const carousel = path.join('file://', __dirname, 'carousel.html');
  let win = new BrowserWindow({ width: 400, height: 400 });
  win.on('close', () => (win = null));
  win.loadURL(carousel);
  win.show();
}
