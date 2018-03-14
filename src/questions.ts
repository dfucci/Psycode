const fs = require('fs');
const path = require('path');

const BrowserWindow = electron.remote.BrowserWindow;
interface IAnswer {
  timestamp: number;
  value: string;
  rank: number;
  subject: string;
  question: string;
}
let answers: IAnswer[] = [];
class Question {
  private correctAnswer: boolean;
  private answer: boolean;
  private questionImage: string;
  private type: string;

  constructor(
    questionImage: string,
    type: string,
    correctAnswer: boolean = true
  ) {
    this.questionImage = questionImage;
    this.correctAnswer = correctAnswer;
    this.type = type;
  }
  public getImage() {
    return this.questionImage;
  }

  public getType() {
    return this.type;
  }
}

const timeouts: { [key: string]: () => number } = {
  review: () => 10000,
  prose: () => 5000,
  fixation: () => 1000 * Math.floor(Math.random() * 6) + 2
};

let timeHandle: any;
let questions: Question[] = this.createQuestions();
function startCarousel(): void {
  function nextPicture(qs: Question[]) {
    clearTimeout(timeHandle);
    const picture = qs.shift();
    if (picture) {
      replaceImage(picture);
      const type = picture.getType();
      let timeleft = timeouts[type]();
      timeHandle = setTimeout(() => nextPicture(qs), timeouts[type]());
      const countdown = setInterval(() => {
        if (type !== 'fixation') {
          timeleft = timeleft - 1000;
          if (timeleft <= 3000) {
            console.log(timeleft);
            document.getElementById('countdown').textContent = String(
              timeleft / 1000
            );
          }
          if (timeleft <= 0) {
            document.getElementById('countdown').textContent = '';
            clearInterval(countdown);
          }
        }
      }, 1000);
      console.log('replace image');
      console.log(timeHandle);
    }
  }
  nextPicture(questions);
}

function nextQuestion(e: any) {
  console.log(e);
  let answer: IAnswer;
  answer = {
    question: document
      .getElementById('question')
      .children[0].getAttribute('src')
      .split('/')[4]
      .split('.')[0],
    timestamp: new Date().getTime(),
    value: e.which,
    rank: answers.length,
    subject: localStorage.getItem('subject')
  };
  console.log(answer);
  answers.push(answer);
  console.log(answers);
}

function replaceImage(obj: Question) {
  const div = document.getElementById('buttons');
  const el = document.querySelector('img');
  if (obj.getType() === 'fixation') {
    div.style.visibility = 'hidden';
  } else {
    div.style.visibility = 'visible';
  }

  el.setAttribute(
    'src',
    `./assets/questions/${obj.getType()}/${obj.getImage()}`
  );
}

function createQuestions(): Question[] {
  function createQuestionOfType(type: string): Question[] {
    const questionFolder = `./assets/questions/${type}`;
    const questionArray: Question[] = [];
    fs
      .readdirSync(questionFolder)
      // .sort(() => 0.5 - Math.random())
      // .slice(0, 10)
      .forEach((file: any) => {
        const q = new Question(file, type);
        questionArray.push(q);
      });
    return questionArray;
  }
  const qReview = createQuestionOfType('review');
  const qProse = createQuestionOfType('prose');
  const block1: Question[] = qReview
    .splice(0, 3)
    .concat(qProse.splice(0, 6))
    .sort(() => 0.5 - Math.random());

  const block2: Question[] = qReview
    .splice(0, 3)
    .concat(qProse.splice(0, 6))
    .sort(() => 0.5 - Math.random());

  const block3: Question[] = qReview
    .splice(0, 3)
    .concat(qProse.splice(0, 6))
    .sort(() => 0.5 - Math.random());

  const block4: Question[] = qReview
    .splice(0, 3)
    .concat(qProse.splice(0, 6))
    .sort(() => 0.5 - Math.random());

  const fixation = new Question('fixation.jpg', 'fixation');
  const out: Question[] = block1.concat(
    fixation,
    block2,
    fixation,
    block3,
    fixation,
    block4
  );
  console.log(out);

  return out;
}

function createQuestionWindow(e: any): void {
  e.preventDefault();
  const carousel = path.join('file://', __dirname, 'carousel.html');
  let win = new BrowserWindow({ width: 800, height: 800 });
  win.on('close', () => (win = null));
  win.loadURL(carousel);
}
