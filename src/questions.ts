// tslint:disable:no-var-requires
const fs = require('fs');
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
  public getQuestionImage() {
    return this.questionImage;
  }
}
function startCarousel(): void {
  const questions: Question[] = this.createQuestionsSequence();
  const el = document.querySelector('img');
  questions.forEach((obj: Question, index: number) => {
    const timer = setTimeout(() => {
      console.log('foobar');
      el.setAttribute(
        'src',
        `./assets/questions/review/${obj.getQuestionImage()}`
      );
    }, index * 2000);
  });
}

function createQuestionsSequence(): Question[] {
  console.log('create seq');
  const questionFolder = './assets/questions/review';
  const questions: Question[] = [];
  fs
    .readdirSync(questionFolder)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10)
    .forEach((file: any) => {
      const q = new Question(file, questionsType.Review, true);
      questions.push(q);
      console.log(q);
    });
  return questions;
}

function createQuestionWindow(e: any): void {
  e.preventDefault();
  const carousel = path.join('file://', __dirname, 'carousel.html');
  let win = new BrowserWindow({ width: 500, height: 500 });
  win.on('close', () => (win = null));
  win.loadURL(carousel);
}
