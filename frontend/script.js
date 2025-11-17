import { QuestionService } from './services/QuestionService.js';
import { GameState } from './models/GameState.js';
import { UIManager } from './ui/UIManager.js';

class QuizGame {
    constructor() {
        this.questionService = new QuestionService();
        this.gameState = new GameState();
        this.uiManager = new UIManager();
        
        this.init();
    }

    async init() {
        try {
            console.log('🎬 Inicializando Quiz com Pipoca...');
            
            // Configura os event listeners primeiro
            this.bindEvents();
            
            // Tenta carregar perguntas
            await this.questionService.loadQuestions();
            console.log('✅ Perguntas carregadas com sucesso');
            
            // Atualiza as estatísticas na tela inicial
            this.uiManager.updateStatsDisplay(this.gameState.stats);
            
            // Torna o game acessível globalmente para callbacks
            window.quizGame = this;
            
            console.log('🚀 Quiz inicializado e pronto!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            // Mesmo com erro, o jogo deve tentar funcionar
            this.uiManager.updateStatsDisplay(this.gameState.stats);
            window.quizGame = this;
        }
    }

    bindEvents() {
        try {
            this.uiManager.startBtn.addEventListener('click', () => this.startGame());
            this.uiManager.playAgainBtn.addEventListener('click', () => this.startGame());
            this.uiManager.fiftyFiftyBtn.addEventListener('click', () => this.useFiftyFifty());
            this.uiManager.walkAwayBtn.addEventListener('click', () => this.walkAway());
            console.log('✅ Event listeners configurados');
        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
        }
    }

    async startGame() {
        try {
            console.log('🎯 Iniciando novo jogo...');
            
            // Reseta o estado do jogo
            this.gameState.reset();
            
            // Obtém perguntas aleatórias
            const questions = await this.questionService.getRandomQuestions();
            
            if (!questions || questions.length === 0) {
                throw new Error('Nenhuma pergunta disponível');
            }
            
            this.gameState.setQuestions(questions);
            
            // Prepara a UI
            this.uiManager.showScreen('game');
            this.uiManager.enableFiftyFifty();
            this.uiManager.updatePrizes(this.gameState.getCurrentPrizeLevel());
            
            // Inicia o timer
            this.startTimer();
            
            // Carrega a primeira pergunta
            this.loadQuestion();
            
            console.log('🎮 Jogo iniciado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao iniciar jogo:', error);
            alert('Erro ao carregar perguntas. Tente recarregar a página.');
        }
    }

    startTimer() {
        // Para qualquer timer anterior
        this.gameState.stopTimer();
        
        this.gameState.timeLeft = 287;
        this.uiManager.updateTimer(this.gameState.timeLeft);
        
        this.gameState.timerInterval = setInterval(() => {
            this.gameState.timeLeft--;
            this.uiManager.updateTimer(this.gameState.timeLeft);
            
            if (this.gameState.timeLeft <= 0) {
                this.endGame(false, false, true);
            }
        }, 1000);
    }

    loadQuestion() {
        if (this.gameState.currentQuestion >= this.gameState.questions.length) {
            this.endGame(true);
            return;
        }

        const question = this.gameState.getCurrentQuestion();
        
        if (!question) {
            console.error('❌ Pergunta não encontrada');
            this.endGame(false);
            return;
        }
        
        this.uiManager.displayQuestion(question, this.gameState.currentQuestion);
        this.uiManager.updatePrizes(this.gameState.getCurrentPrizeLevel());
    }

    checkAnswer(selectedIndex) {
        try {
            const question = this.gameState.getCurrentQuestion();
            
            if (!question) {
                console.error('❌ Pergunta não disponível para verificação');
                return;
            }
            
            const isCorrect = this.gameState.checkAnswer(selectedIndex);
            
            // Mostra feedback visual
            this.uiManager.showAnswerFeedback(selectedIndex, question.correct);
            
            if (isCorrect) {
                console.log('✅ Resposta correta!');
                // Avança para próxima pergunta após delay
                setTimeout(() => {
                    this.gameState.nextQuestion();
                    this.loadQuestion();
                }, 1500);
            } else {
                console.log('❌ Resposta incorreta');
                // Fim de jogo por resposta errada
                setTimeout(() => {
                    this.endGame(false);
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar resposta:', error);
            this.endGame(false);
        }
    }

    useFiftyFifty() {
        if (this.gameState.fiftyFiftyUsed) {
            console.log('⚠️ 50:50 já foi usado');
            return;
        }
        
        this.gameState.useFiftyFifty();
        this.uiManager.disableFiftyFifty();
        
        const question = this.gameState.getCurrentQuestion();
        if (question) {
            this.uiManager.hideWrongOptions(question.correct, question.options.length);
            console.log('🎯 50:50 aplicado - 2 opções removidas');
        }
    }

    walkAway() {
        console.log('🏃 Jogador decidiu parar');
        this.endGame(true, true);
    }

    async endGame(isWin, walkedAway = false, timeUp = false) {
        try {
            // Para o timer
            this.gameState.stopTimer();
            
            const prize = this.gameState.calculatePrize(isWin, walkedAway, timeUp);
            
            // Atualiza estatísticas (passa o questionService para tentar salvar no backend)
            await this.gameState.updateStats(prize, this.questionService);
            
            this.uiManager.showResultScreen(
                prize, 
                isWin, 
                walkedAway, 
                timeUp, 
                this.gameState.score,
                this.gameState.currentQuestion
            );
            
            this.uiManager.updateStatsDisplay(this.gameState.stats);
            
            console.log(`🎯 Fim de jogo: ${isWin ? 'Vitória' : 'Derrota'} | Prêmio: R$ ${prize}`);
            
        } catch (error) {
            console.error('❌ Erro no fim de jogo:', error);
            // Tenta mostrar pelo menos a tela de resultado básica
            this.uiManager.showScreen('result');
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, iniciando quiz...');
    new QuizGame();
});

// Export para possível uso externo
export { QuizGame };