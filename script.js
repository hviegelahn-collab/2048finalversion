const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const overlay = document.getElementById('game-over');
let board = Array(16).fill(0);
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Initialize
function initBoard() {
    board.fill(0);
    score = 0;
    updateScore();
    addRandomTile();
    addRandomTile();
    renderBoard();
    overlay.style.display = 'none';
}

// Add random tile
function addRandomTile() {
    let empty = [];
    board.forEach((val, idx) => { if(val === 0) empty.push(idx); });
    if(empty.length === 0) return;
    let pos = empty[Math.floor(Math.random() * empty.length)];
    board[pos] = Math.random() < 0.9 ? 2 : 4;
}

// Render board
function renderBoard() {
    gameContainer.innerHTML = '';
    board.forEach(value => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        if(value > 0){
            tile.style.backgroundColor = getTileColor(value);
            tile.innerHTML = `<span>${value}</span>`;
        }
        gameContainer.appendChild(tile);
    });
}

// Tile colors
function getTileColor(value){
    const colors = getComputedStyle(document.documentElement).getPropertyValue('--tile-colors').trim().split(' ');
    let idx = Math.min(Math.log2(value) - 1, colors.length - 1);
    return colors[idx];
}

// Move logic
function move(dir){
    let rotated = dir==='up'||dir==='down';
    let reversed = dir==='right'||dir==='down';
    let newBoard = [...board];

    function compress(row){
        let arr = row.filter(x=>x!==0);
        for(let i=0;i<arr.length-1;i++){
            if(arr[i]===arr[i+1]){
                arr[i]*=2;
                score += arr[i];
                arr[i+1]=0;
            }
        }
        return arr.filter(x=>x!==0).concat(Array(row.length).fill(0)).slice(0,row.length);
    }

    for(let i=0;i<4;i++){
        let row=[];
        for(let j=0;j<4;j++){
            let idx = rotated ? j*4 + i : i*4 + j;
            row.push(newBoard[idx]);
        }
        if(reversed) row.reverse();
        row=compress(row);
        if(reversed) row.reverse();
        for(let j=0;j<4;j++){
            let idx = rotated ? j*4 + i : i*4 + j;
            newBoard[idx]=row[j];
        }
    }

    if(board.toString() !== newBoard.toString()){
        board = newBoard;
        addRandomTile();
        renderBoard();
        updateScore();
        if(checkGameOver()) showGameOver();
    }
}

// Update scores
function updateScore(){
    scoreDisplay.textContent = score;
    if(score > highScore){
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    highScoreDisplay.textContent = highScore;
}

// Check Game Over
function checkGameOver(){
    if(board.includes(0)) return false;
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            let idx=i*4+j;
            let val=board[idx];
            if(j<3 && val===board[idx+1]) return false;
            if(i<3 && val===board[idx+4]) return false;
        }
    }
    return true;
}

// Show Game Over
function showGameOver(){
    overlay.style.display='flex';
}

// Keyboard
document.addEventListener('keydown', e=>{
    if(e.key==='ArrowUp') move('up');
    if(e.key==='ArrowDown') move('down');
    if(e.key==='ArrowLeft') move('left');
    if(e.key==='ArrowRight') move('right');
});

// Mobile swipe
let touchStartX=0, touchStartY=0;
gameContainer.addEventListener('touchstart', e=>{
    touchStartX=e.touches[0].clientX;
    touchStartY=e.touches[0].clientY;
});
gameContainer.addEventListener('touchend', e=>{
    let dx=e.changedTouches[0].clientX - touchStartX;
    let dy=e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx)>Math.abs(dy)){
        if(dx>30) move('right'); else if(dx<-30) move('left');
    } else {
        if(dy>30) move('down'); else if(dy<-30) move('up');
    }
});

// Restart buttons
document.querySelector('.restart-btn').addEventListener('click', initBoard);
document.getElementById('restart-overlay').addEventListener('click', initBoard);

initBoard();