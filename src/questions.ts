const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;
const BrowserWindow = electron.remote.BrowserWindow;

let questions: Question[];
window.onload = () => {
  questions = createQuestionsSequence();
  startCarousel();
};
window.addEventListener('keyup', handleKeyPress, true);
function handleKeyPress(e: any) {
  if (e.keyCode === 37 || e.keyCode === 39) {
    answerQuestion(e);
    window.removeEventListener('keyup', handleKeyPress, true);
  }
}
interface IAnswer {
  timestamp: number;
  value: string;
  rank: number;
  subject: string;
  question: string;
}
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

let timeHandle: any;
let answers: IAnswer[] = [];
const timeouts: { [key: string]: () => number } = {
  fixation: () => 1000 * Math.floor(Math.random() * 6) + 2,
  prose: () => 5000,
  review: () => 10000
};

function startCarousel(): any {
  console.log(questions);

  function nextPicture(qs: Question[]) {
    clearTimeout(timeHandle);
    const picture = qs.shift();
    if (picture) {
      replaceImage(picture);
      toggleButtons(picture);
      const type = picture.getType();
      let timeleft = timeouts[type]();
      timeHandle = setTimeout(() => nextPicture(qs), timeouts[type]());
      const countdown = setInterval(() => {
        if (type !== 'fixation') {
          timeleft = timeleft - 1000;
          if (timeleft <= 3000) {
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
    } else {
      const csvAnswers = json2csv(answers);
      console.log(csvAnswers);
    }
  }
  nextPicture(questions);
}

function answerQuestion(e: any) {
  let answer: IAnswer;
  answer = {
    question: document
      .getElementById('question')
      .children[0].getAttribute('src')
      .split('/')[4]
      .split('.')[0],
    rank: answers.length,
    subject: localStorage.getItem('subject'),
    timestamp: new Date().getTime(),
    value: e.which === 37 ? 'Accept' : 'Reject'
  };
  answers.push(answer);
}

function replaceImage(obj: Question) {
  const el = document.querySelector('img');
  el.setAttribute(
    'src',
    `./assets/questions/${obj.getType()}/${obj.getImage()}`
  );
}

function toggleButtons(obj: Question) {
  const buttons = document.getElementById('buttons');
  obj.getType() === 'fixation'
    ? (buttons.style.visibility = 'hidden')
    : (buttons.style.visibility = 'visible');
}

function createQuestionsSequence(): Question[] {
  function createQuestionOfType(type: string): Question[] {
    const questionFolder = `./assets/questions/${type}`;
    const questionArray: Question[] = [];
    fs.readdirSync(questionFolder).forEach((file: any) => {
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
  return out;
}

function createQuestionWindow(e: any): void {
  e.preventDefault();
  const carousel = path.join('file://', __dirname, 'carousel.html');
  let win = new BrowserWindow({ width: 800, height: 800 });
  win.on('close', () => (win = null));
  win.loadURL(carousel);
}
