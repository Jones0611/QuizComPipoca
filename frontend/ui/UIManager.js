export class UIManager {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        
        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.fiftyFiftyBtn = document.getElementById('fifty-fifty');
        this.walkAwayBtn = document.getElementById('walk-away');
        
        // Game elements
        this.questionText = document.getElementById('question-text');
        this.questionNumber = document.getElementById('question-number');
        this.difficulty = document.getElementById('difficulty');
        this.optionsContainer = document.getElementById('options-container');
        this.timer = document.getElementById('timer');
        
        // Result elements
        this.resultMessage = document.getElementById('result-message');
        this.prizeWon = document.getElementById('prize-won');
        this.resultDetails = document.getElementById('result-details');
        this.resultIcon = document.getElementById('result-icon');
        
        // Stats elements
        this.totalGames = document.getElementById('total-games');
        this.bestScore = document.getElementById('best-score');
        this.correctAnswers = document.getElementById('correct-answers');
    }

    showScreen(screenName) {
        // Esconde todas as telas
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');
        
        // Mostra a tela solicitada
        this[`${screenName}Screen`].classList.add('active');
    }

    displayQuestion(question, questionIndex) {
        this.questionNumber.textContent = `PERGUNTA ${questionIndex + 1}/15`;
        this.questionText.textContent = question.question;
        
        // Atualiza a dificuldade com cores específicas
        this.difficulty.textContent = question.difficulty.toUpperCase();
        this.difficulty.className = `difficulty ${question.difficulty}`;
        
        // Adiciona indicação visual da fase
        this.updatePhaseIndicator(questionIndex);
        
        this.renderOptions(question);
    }

    updatePhaseIndicator(questionIndex) {
        // Remove indicadores anteriores
        const existingIndicator = document.querySelector('.phase-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Adiciona novo indicador
        let phaseText = '';
        if (questionIndex < 5) {
            phaseText = 'FASE 1: PERGUNTAS FÁCEIS';
        } else if (questionIndex < 10) {
            phaseText = 'FASE 2: PERGUNTAS MÉDIAS';
        } else {
            phaseText = 'FASE 3: PERGUNTAS DIFÍCEIS';
        }

        const phaseIndicator = document.createElement('div');
        phaseIndicator.className = 'phase-indicator';
        phaseIndicator.textContent = phaseText;
        phaseIndicator.style.cssText = `
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;

        this.questionNumber.parentNode.insertBefore(phaseIndicator, this.questionNumber.nextSibling);
    }

    renderOptions(question) {
        this.optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'btn btn-option';
            button.textContent = option;
            button.addEventListener('click', () => {
                if (window.quizGame) {
                    window.quizGame.checkAnswer(index);
                }
            });
            this.optionsContainer.appendChild(button);
        });
    }

    showAnswerFeedback(selectedIndex, correctIndex) {
        const options = this.optionsContainer.querySelectorAll('.btn-option');
        
        // Desabilita todos os botões
        options.forEach(opt => opt.disabled = true);
        
        // Mostra resposta correta
        options[correctIndex].classList.add('correct');
        
        // Mostra resposta errada se aplicável
        if (selectedIndex !== correctIndex) {
            options[selectedIndex].classList.add('wrong');
        }
    }

    hideWrongOptions(correctIndex, totalOptions) {
        const options = this.optionsContainer.querySelectorAll('.btn-option');
        const wrongOptions = Array.from({length: totalOptions}, (_, i) => i)
            .filter(i => i !== correctIndex)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        
        wrongOptions.forEach(index => {
            options[index].style.display = 'none';
        });
    }

    disableFiftyFifty() {
        this.fiftyFiftyBtn.disabled = true;
    }

    enableFiftyFifty() {
        this.fiftyFiftyBtn.disabled = false;
    }

    updateTimer(timeLeft) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        this.timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    updatePrizes(currentLevel) {
        // Remove classe active de todos os prêmios
        for (let i = 1; i <= 15; i++) {
            const prizeElement = document.getElementById(`prize-${i}`);
            if (prizeElement) {
                prizeElement.classList.remove('active');
            }
        }
        
        // Adiciona classe active ao prêmio atual
        if (currentLevel < 15) {
            const currentPrize = document.getElementById(`prize-${currentLevel + 1}`);
            if (currentPrize) {
                currentPrize.classList.add('active');
            }
        }
    }

    showResultScreen(prize, isWin, walkedAway, timeUp, score, currentQuestion) {
        this.prizeWon.textContent = `R$ ${prize.toLocaleString()}`;
        
        if (isWin && !walkedAway) {
            this.resultMessage.textContent = "VITÓRIA PERFEITA!";
            this.resultDetails.textContent = "Você dominou todas as fases! Acertou todas as 15 perguntas, das fáceis às difíceis!";
            this.resultIcon.textContent = "🏆";
        } else if (walkedAway) {
            const phase = currentQuestion < 5 ? "fáceis" : currentQuestion < 10 ? "médias" : "difíceis";
            this.resultMessage.textContent = "VOCÊ PAROU";
            this.resultDetails.textContent = `Estratégia conservadora! Na fase ${phase}, você garantiu R$ ${prize.toLocaleString()} e acertou ${score} de ${currentQuestion} perguntas.`;
            this.resultIcon.textContent = "💼";
        } else if (timeUp) {
            this.resultMessage.textContent = "TEMPO ESGOTADO";
            this.resultDetails.textContent = `O tempo acabou! Você acertou ${score} de ${currentQuestion} perguntas e leva R$ ${prize.toLocaleString()}.`;
            this.resultIcon.textContent = "⏰";
        } else {
            const phase = currentQuestion < 5 ? "fáceis" : currentQuestion < 10 ? "médias" : "difíceis";
            this.resultMessage.textContent = "FIM DE JOGO";
            this.resultDetails.textContent = `Você chegou às perguntas ${phase}! Acertou ${score} de ${currentQuestion + 1} perguntas e leva R$ ${prize.toLocaleString()} para casa.`;
            this.resultIcon.textContent = "🎬";
        }
        
        this.showScreen('result');
    }

    updateStatsDisplay(stats) {
        this.totalGames.textContent = stats.totalGames;
        this.bestScore.textContent = `R$ ${stats.bestScore.toLocaleString()}`;
        
        const totalQuestions = stats.totalGames * 15;
        const accuracy = totalQuestions > 0 ? 
            Math.round((stats.totalCorrect / totalQuestions) * 100) : 0;
        this.correctAnswers.textContent = `${accuracy}%`;
    }
}