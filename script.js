const BOARD_SIZE = 10;
        const MINES_COUNT = 10;
        let board = [];
        let gameOver = false;
        let timer = 0;
        let timerInterval;
        let firstClick = true;

        function createBoard() {
            const boardElement = document.getElementById('board');
            boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 30px)`;
            boardElement.innerHTML = '';
            
            for (let i = 0; i < BOARD_SIZE; i++) {
                board[i] = [];
                for (let j = 0; j < BOARD_SIZE; j++) {
                    board[i][j] = {
                        isMine: false,
                        revealed: false,
                        flagged: false,
                        neighborMines: 0
                    };
                    
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.addEventListener('click', handleClick);
                    cell.addEventListener('contextmenu', handleRightClick);
                    boardElement.appendChild(cell);
                }
            }
        }

        function placeMines(firstRow, firstCol) {
            let minesPlaced = 0;
            while (minesPlaced < MINES_COUNT) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                
                if (!board[row][col].isMine && !(row === firstRow && col === firstCol)) {
                    board[row][col].isMine = true;
                    minesPlaced++;
                }
            }
            calculateNumbers();
        }

        function calculateNumbers() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (!board[i][j].isMine) {
                        board[i][j].neighborMines = countNeighborMines(i, j);
                    }
                }
            }
        }

        function countNeighborMines(row, col) {
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < BOARD_SIZE && 
                        newCol >= 0 && newCol < BOARD_SIZE &&
                        board[newRow][newCol].isMine) {
                        count++;
                    }
                }
            }
            return count;
        }

        function handleClick(event) {
            if (gameOver) return;
            
            const row = parseInt(event.target.dataset.row);
            const col = parseInt(event.target.dataset.col);
            
            if (board[row][col].flagged) return;
            
            if (firstClick) {
                firstClick = false;
                placeMines(row, col);
                startTimer();
            }

            if (board[row][col].isMine) {
                gameOver = true;
                revealAll();
                document.getElementById('message').textContent = 'Game Over!';
                stopTimer();
                return;
            }

            reveal(row, col);
            checkWin();
        }

        function handleRightClick(event) {
            event.preventDefault();
            if (gameOver || firstClick) return;
            
            const cell = event.target;
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (!board[row][col].revealed) {
                board[row][col].flagged = !board[row][col].flagged;
                cell.classList.toggle('flagged');
                updateMineCount();
            }
        }

        function reveal(row, col) {
            if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE ||
                board[row][col].revealed || board[row][col].flagged) return;

            board[row][col].revealed = true;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('revealed');

            if (board[row][col].neighborMines > 0) {
                cell.textContent = board[row][col].neighborMines;
            } else {
                // Reveal neighbors for cells with no adjacent mines
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        reveal(row + i, col + j);
                    }
                }
            }
        }

        function checkWin() {
            let unrevealedSafeCells = 0;
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (!board[i][j].isMine && !board[i][j].revealed) {
                        unrevealedSafeCells++;
                    }
                }
            }
            
            if (unrevealedSafeCells === 0) {
                gameOver = true;
                document.getElementById('message').textContent = 'You Win!';
                stopTimer();
            }
        }

        function revealAll() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (board[i][j].isMine) {
                        cell.classList.add('mine');
                    }
                }
            }
        }

        function updateMineCount() {
            let flagCount = 0;
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (board[i][j].flagged) flagCount++;
                }
            }
            document.getElementById('mine-count').textContent = MINES_COUNT - flagCount;
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timer++;
                document.getElementById('timer').textContent = timer;
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
        }

        function resetGame() {
            board = [];
            gameOver = false;
            firstClick = true;
            timer = 0;
            document.getElementById('timer').textContent = '0';
            document.getElementById('message').textContent = '';
            stopTimer();
            createBoard();
            updateMineCount();
        }

        // Initialize game
        resetGame();