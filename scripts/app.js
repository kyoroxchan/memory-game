/**
 * HTMLのbody要素
 * @type {HTMLElement}
 */
const body = document.body;
/**
 * ゲーム開始ボタンの要素
 * @type {HTMLElement}
 */
const startButton = document.getElementById('start-button');

/**
 * ゲームクリア画面の再スタートボタンの要素
 * @type {HTMLElement}
 */
const restartButton = document.getElementById('restart-button');

/**
 * ミッション画面の要素
 * @type {HTMLElement}
 */
const missionScreen = document.getElementById('mission-screen');
const missionScreenLeft = document.querySelector('.left-screen');
const missionScreenRight = document.querySelector('.right-screen');
const missionText = document.querySelector('.mission-text');
/**
 * メモリーゲームのコンテナ要素
 * @type {HTMLElement}
 */
const memoryGame = document.getElementById('memory-game');

/**
 * ゲーム開始画面の要素
 * @type {HTMLElement}
 */
const gameStartScreen = document.getElementById('start-screen');

/**
 * ゲームクリア画面の要素
 * @type {HTMLElement}
 */
const gameClearScreen = document.getElementById('game-clear-screen');

/**
 * カードが一致したときの音声
 * @type {HTMLAudioElement}
 */
const matchSound = new Audio('sounds/match-sound.mp3');

/**
 * カードをめくるときの音声
 * @type {HTMLAudioElement}
 */
const flipSound = new Audio('sounds/flip-sound.mp3');

/**
 * カードを裏向きに戻すときの音声
 * @type {HTMLAudioElement}
 */
const unflipSound = new Audio('sounds/unflip-sound.mp3');

/**
 * ゲーム開始時の音声
 * @type {HTMLAudioElement}
 */
const startSound = new Audio('sounds/start-sound.mp3');

/**
 * ゲームクリア時の音声
 * @type {HTMLAudioElement}
 */
const clearSound = new Audio('sounds/clear-sound.mp3');

/**
 * カード要素の配列
 * @type {HTMLElement[]}
 */
const cards = [];

const cardNum = 14; // カードのペアの数
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let matches = 0;
let timesFlipped = 0;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

/**
 * ゲームを開始する関数
 */
function startGame() {
    playStartSound();
    showMissionScreen();
    initializeGame();
    waitForCompletion();
}
/**
 * ゲーム開始時の音を再生する関数
 */
function playStartSound() {
    startSound.currentTime = 0; // 再生位置をリセット
    startSound.play(); // ゲーム開始時の音を再生
}

/**
 * ミッション画面を表示する関数
 */
function showMissionScreen() {
    missionScreen.style.display = 'flex';
    missionText.classList.remove('fadeOut');
    missionText.classList.add('fadeIn');
    missionScreenLeft.classList.remove('slideOutTopLeft');
    missionScreenRight.classList.remove('slideOutBottomRight');
    missionScreenLeft.classList.add('slideInTopLeft');
    missionScreenRight.classList.add('slideInBottomRight');
}

/**
 * ゲームを初期化する関数
 */
function initializeGame() {
    timesFlipped = 0;
    generateCards(cardNum); // カードのペアの数を指定
    shuffle();
    cards.forEach(card => card.addEventListener('click', flipCard));
    setTimeout(() => {
        memoryGame.style.display = 'flex';
    }, 2000); // 2秒後に表示
}

/**
 * ミッション画面の表示を待つ関数
 */
function waitForCompletion() {
    const startTime = Date.now();
    const minWaitTime = 4000; // 最低4秒待つ
    const checkCompletion = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minWaitTime - elapsedTime;
        if (remainingTime > 0) {
            setTimeout(() => {
                hideMissionScreen();
            }, remainingTime);
        } else {
            hideMissionScreen();
        }
    };
    checkCompletion();
}

/**
 * ミッション画面を非表示にする関数
 */
function hideMissionScreen() {
    missionText.classList.remove('fadeIn');
    missionText.classList.add('fadeOut');
    setTimeout(() => {
        missionScreenLeft.classList.remove('slideInTopLeft');
        missionScreenRight.classList.remove('slideInBottomRight');
        missionScreenLeft.classList.add('slideOutTopLeft');
        missionScreenRight.classList.add('slideOutBottomRight');
        gameStartScreen.style.display = 'none';
        gameClearScreen.style.display = 'none';
    }, 1000);
    setTimeout(() => {
        missionScreen.style.display = 'none';
        body.style.overflowY = 'auto';
    }, 1500); // アニメーションの時間に合わせて調整
}


/**
 * ゲームを再スタートする関数
 */
function restartGame() {
    matches = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    timesFlipped = 0;
    memoryGame.innerHTML = '';
    cards.length = 0;
    startGame();
}

/**
 * カードを生成する関数
 * @param {number} numPairs - カードのペアの数
 */
function generateCards(numPairs) {
    const cardPairs = [];
    for (let i = 1; i <= numPairs; i++) {
        cardPairs.push(i, i);
    }
    cardPairs.forEach(value => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.card = value;
        card.innerHTML = `
            <div class="front-face" style="background-image: url('images/front-face.png');"></div>
            <div class="back-face" style="background-image: url('images/back-face/${value}.png');"></div>
        `;
        memoryGame.appendChild(card);
        cards.push(card);
    });
}

/**
 * カードをめくる関数
 */
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');
    flipSound.currentTime = 0; // 再生位置をリセット
    flipSound.play(); // カードをめくるときの音を再生

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    hasFlippedCard = false;
    timesFlipped += 1;
    checkForMatch();
}

/**
 * カードが一致するかどうかをチェックする関数
 */
function checkForMatch() {
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;
    isMatch ? disableCards() : unflipCards();
}

/**
 * 一致したカードを無効にする関数
 */
function disableCards() {
    lockBoard = true; // ボードをロック
    setTimeout(() => {
        firstCard.querySelector('.back-face').classList.add('matched');
        secondCard.querySelector('.back-face').classList.add('matched');
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchSound.play(); // 一致したときの音を再生
        matches += 1;
        if (matches === cards.length / 2) {
            setTimeout(() => {
                memoryGame.style.display = 'none';
                gameClearScreen.style.display = 'flex';
                body.style.overflowY = 'hidden';
                clearSound.currentTime = 0; // 再生位置をリセット
                clearSound.play(); // ゲームクリア時の音を再生
                document.getElementById('times-flipped').textContent = timesFlipped;
                lockBoard = false; // ボードのロックを解除
            }, 700);
        } else {
            lockBoard = false; // ボードのロックを解除
        }
    }, 300);
}

/**
 * カードを元に戻す関数
 */
function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        unflipSound.currentTime = 0; // 再生位置をリセット
        unflipSound.play(); // カードを裏向きに戻すときの音を再生
        lockBoard = false;
    }, 700);
}

/**
 * カードをシャッフルする関数
 */
function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
}