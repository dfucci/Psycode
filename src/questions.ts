const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;
const BrowserWindow = electron.remote.BrowserWindow;
const remote = require('electron').remote;

let questions: Question[];
window.onload = () => {
  questions = createQuestionsSequence();
  startCarousel();
};
window.addEventListener('keyup', handleKeyPress, true);
function handleKeyPress(e: any) {
  activeButtons(false);
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
  function nextPicture(qs: Question[]) {
    activeButtons(true);
    clearTimeout(timeHandle);
    const picture = qs.shift();
    if (picture) {
      window.addEventListener('keyup', handleKeyPress, true);
      replaceImage(picture);
      if (picture.getType() === 'fixation') {
        activeButtons(false);
      }
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
      ipcRenderer.send('answers:save', csvAnswers);
      remote.getCurrentWindow().close();
    }
  }
  nextPicture(questions);
}

function answerQuestion(e: any) {
  let answer: IAnswer;
  answer = {
    question: path
      .basename(
        document.getElementById('question').children[0].getAttribute('src')
      )
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
    path.join(
      'file://',
      __dirname,
      'assets/questions/',
      obj.getType(),
      obj.getImage()
    )
  );
}

function activeButtons(active: boolean) {
  const buttons = document.getElementsByClassName('button');
  if (active) {
    (buttons[0] as HTMLElement).style.visibility = 'visible';
    (buttons[1] as HTMLElement).style.visibility = 'visible';
  } else {
    (buttons[0] as HTMLElement).style.visibility = 'hidden';
    (buttons[1] as HTMLElement).style.visibility = 'hidden';
  }
}

function createQuestionsSequence(): Question[] {
  function createQuestionOfType(type: string): Question[] {
    const questionFolder = path.join(__dirname, '/assets/questions/', type);
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
