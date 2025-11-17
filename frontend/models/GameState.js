export class GameState {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.fiftyFiftyUsed = false;
        this.timeLeft = 287;
        this.timerInterval = null;
        this.stats = this.loadStats();
    }

    setQuestions(questions) {
        this.questions = questions;
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestion];
    }

    getCurrentDifficulty() {
        const question = this.getCurrentQuestion();
        return question ? question.difficulty : 'easy';
    }

    getDifficultyProgress() {
        if (this.currentQuestion < 5) return 'easy';
        if (this.currentQuestion < 10) return 'medium';
        return 'hard';
    }

    checkAnswer(selectedIndex) {
        const question = this.getCurrentQuestion();
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.score++;
        }
        
        return isCorrect;
    }

    nextQuestion() {
        this.currentQuestion++;
    }

    useFiftyFifty() {
        this.fiftyFiftyUsed = true;
    }

    calculatePrize(isWin, walkedAway = false, timeUp = false) {
        const prizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
        
        if (isWin && !walkedAway && !timeUp) {
            return prizes[14];
        } else if (walkedAway) {
            return prizes[Math.min(this.currentQuestion, 14)];
        } else {
            // Garante prêmios mínimos por fase
            if (this.currentQuestion < 5) return prizes[4]; // Fácil: R$ 1.000
            if (this.currentQuestion < 10) return prizes[9]; // Médio: R$ 32.000
            return prizes[14]; // Difícil: R$ 1.000.000
        }
    }

    async updateStats(prize, questionService = null) {
        this.stats.totalGames++;
        this.stats.totalCorrect += this.score;
        this.stats.bestScore = Math.max(this.stats.bestScore, prize);
        
        // Atualiza estatísticas por dificuldade
        const difficulty = this.getDifficultyProgress();
        if (!this.stats.byDifficulty) {
            this.stats.byDifficulty = { easy: 0, medium: 0, hard: 0 };
        }
        this.stats.byDifficulty[difficulty] = (this.stats.byDifficulty[difficulty] || 0) + 1;
        
        this.saveStats();
        
        // Tenta salvar no backend também se o service foi fornecido
        if (questionService && typeof questionService.saveGameStats === 'function') {
            try {
                await questionService.saveGameStats({
                    score: this.score,
                    correctAnswers: this.score,
                    prize: prize,
                    totalQuestions: this.currentQuestion + 1,
                    difficulty: difficulty
                });
            } catch (error) {
                console.log('Estatísticas não salvas no backend (normal em desenvolvimento)');
            }
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('quizStats');
            return saved ? JSON.parse(saved) : {
                totalGames: 0,
                totalCorrect: 0,
                bestScore: 0,
                byDifficulty: { easy: 0, medium: 0, hard: 0 }
            };
        } catch (error) {
            return {
                totalGames: 0,
                totalCorrect: 0,
                bestScore: 0,
                byDifficulty: { easy: 0, medium: 0, hard: 0 }
            };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('quizStats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Não foi possível salvar estatísticas no localStorage');
        }
    }

    reset() {
        this.currentQuestion = 0;
        this.score = 0;
        this.fiftyFiftyUsed = false;
        this.timeLeft = 287;
        this.timerInterval = null;
    }

    getCurrentPrizeLevel() {
        return this.currentQuestion;
    }

    getGameProgress() {
        return {
            current: this.currentQuestion + 1,
            total: this.questions.length,
            phase: this.getDifficultyProgress(),
            phaseNumber: Math.floor(this.currentQuestion / 5) + 1
        };
    }

    // Novo método para parar o timer explicitamente
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}