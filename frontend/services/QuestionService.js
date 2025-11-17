export class QuestionService {
    constructor() {
        this.questions = [];
        this.loaded = false;
        this.apiBase = this.getApiBase();
    }

    getApiBase() {
        // Em desenvolvimento: localhost
        // Em produção: URL relativa (mesmo domínio)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        } else {
            return '/api'; // Produção - mesmo domínio do frontend
        }
    }

    async loadQuestions() {
        try {
            console.log('🔄 Carregando perguntas da API...');
            const response = await fetch(`${this.apiBase}/questions`);
            
            if (!response.ok) {
                throw new Error(`API respondeu com status: ${response.status}`);
            }
            
            const data = await response.json();
            this.questions = data.questions;
            this.loaded = true;
            console.log('✅ Perguntas carregadas da API:', this.questions.length);
            
        } catch (error) {
            console.warn('❌ Erro na API, usando perguntas locais:', error.message);
            await this.loadLocalQuestions();
        }
    }

    async loadLocalQuestions() {
        try {
            const response = await fetch('./questions.json');
            if (!response.ok) throw new Error('Arquivo local não encontrado');
            
            const data = await response.json();
            this.questions = data.questions;
            this.loaded = true;
            console.log('📁 Perguntas carregadas localmente:', this.questions.length);
            
        } catch (error) {
            console.error('❌ Erro ao carregar perguntas locais:', error);
            this.questions = this.getFallbackQuestions();
            this.loaded = true;
        }
    }

    async getRandomQuestions() {
        if (!this.loaded) {
            await this.loadQuestions();
        }

        // Agrupa perguntas por dificuldade
        const easy = this.questions.filter(q => q.difficulty === 'easy');
        const medium = this.questions.filter(q => q.difficulty === 'medium');
        const hard = this.questions.filter(q => q.difficulty === 'hard');

        console.log(`📊 Estatísticas: Fáceis: ${easy.length}, Médias: ${medium.length}, Difíceis: ${hard.length}`);

        // Seleciona 5 de cada dificuldade em ordem progressiva
        const selected = [
            ...this.shuffleArray(easy).slice(0, 5),    // Perguntas 1-5: Fáceis
            ...this.shuffleArray(medium).slice(0, 5),  // Perguntas 6-10: Médias  
            ...this.shuffleArray(hard).slice(0, 5)     // Perguntas 11-15: Difíceis
        ];

        console.log('🎯 Perguntas selecionadas:', selected.length);
        return selected;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async saveGameStats(stats) {
        try {
            const response = await fetch(`${this.apiBase}/stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId: this.generatePlayerId(),
                    score: stats.score,
                    correctAnswers: stats.correctAnswers,
                    prize: stats.prize,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('✅ Estatísticas salvas na API');
            } else {
                console.warn('⚠️ Estatísticas não salvas na API');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar estatísticas na API:', error.message);
            // Não é crítico - o jogo continua funcionando
        }
    }

    generatePlayerId() {
        // Gera um ID único para o jogador
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    getFallbackQuestions() {
        // Perguntas de fallback caso tudo falhe
        console.log('🆘 Usando perguntas de fallback');
        return [
            {
                id: 1,
                question: "Qual filme ganhou o Oscar de Melhor Filme em 2020?",
                options: ["Parasita", "1917", "Joker", "Era uma vez em Hollywood"],
                correct: 0,
                difficulty: "easy",
                category: "Oscars"
            },
            {
                id: 2,
                question: "Quem dirigiu 'Parasita'?",
                options: ["Bong Joon-ho", "Park Chan-wook", "Kim Ki-duk", "Lee Chang-dong"],
                correct: 0,
                difficulty: "easy", 
                category: "Diretores"
            },
            {
                id: 3,
                question: "Em que ano foi lançado o primeiro filme da franquia 'Star Wars'?",
                options: ["1975", "1977", "1979", "1981"],
                correct: 1,
                difficulty: "easy",
                category: "Ficção Científica"
            }
        ];
    }

    // Método para obter estatísticas do banco de perguntas
    getQuestionStats() {
        const easy = this.questions.filter(q => q.difficulty === 'easy').length;
        const medium = this.questions.filter(q => q.difficulty === 'medium').length;
        const hard = this.questions.filter(q => q.difficulty === 'hard').length;
        
        return {
            total: this.questions.length,
            easy: easy,
            medium: medium,
            hard: hard,
            categories: [...new Set(this.questions.map(q => q.category))]
        };
    }
}