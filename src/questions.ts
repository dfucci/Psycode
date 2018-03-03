const fs = require('fs');
const path = require('path');
const BrowserWindow = electron.remote.BrowserWindow;
class Question {
  private correctAnswer: boolean;
  private answer: boolean;
  private questionImage: string;
  private type: string;

  constructor(questionImage: string, type: string, correctAnswer: boolean) {
    this.questionImage = questionImage;
    this.correctAnswer = correctAnswer;
    this.type = type;
  }
  public getQuestionImage() {
    return this.questionImage;
  }
}

let timeHandle: number;
let restartTimeout: number;
let questions: Question[] = this.createQuestions();
function startCarousel(): void {
  function nextPicture(qs: Question[]) {
    const picture = qs.shift();
    if (picture) {
      replaceImage(picture);
      this.timeHandle = setTimeout(() => nextPicture(qs), 5000);
    } else {
      const el = document.querySelector('img');
      el.setAttribute('src', './assets/questions/fixation.jpg');
      const btnDiv = document.getElementById('buttons');
      btnDiv.style.visibility = 'hidden';
      this.restartTimeout = setTimeout(
        restart,
        1000 * Math.floor(Math.random() * 6) + 2
      );
    }
  }
  nextPicture(questions);
}
function restart() {
  console.log('restarting');
  clearTimeout(this.restartTimeout);
  const btnDiv = document.getElementById('buttons');
  btnDiv.style.visibility = 'visible';
  this.questions = this.createQuestions();
  startCarousel();
}
function nextQuestion() {
  console.log('nextQuestion');
  clearTimeout(this.timeHandle);
  startCarousel();
}

function replaceImage(obj: Question) {
  const el = document.querySelector('img');
  el.setAttribute('src', `./assets/questions/review/${obj.getQuestionImage()}`);
}

function createQuestions(): Question[] {
  function createQuestionOfType(type: string): Question[] {
    const questionFolder = `./assets/questions/${type}`;
    const questionArray: Question[] = [];
    fs
      .readdirSync(questionFolder)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
      .forEach((file: any) => {
        const q = new Question(file, type, true);
        questionArray.push(q);
      });
    return questionArray;
  }
  const qReview = createQuestionOfType('review');
  const qProse = createQuestionOfType('prose');
  return qReview;
}

function createQuestionWindow(e: any): void {
  e.preventDefault();
  const carousel = path.join('file://', __dirname, 'carousel.html');
  let win = new BrowserWindow({ width: 500, height: 500 });
  win.on('close', () => (win = null));
  win.loadURL(carousel);
}
