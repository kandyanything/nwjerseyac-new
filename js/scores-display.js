// Scores Display System
class ScoresDisplay {
    constructor() {
        this.scoresContainer = document.getElementById('scores-container');
        this.lastUpdatedEl = document.getElementById('scores-last-updated');
        this.init();
    }

    async init() {
        await this.loadScores();
        this.setupRefreshButton();
    }

    async loadScores() {
        try {
            // Try to fetch from Netlify function first
            let scores = await this.fetchFromFunction();

            // Fallback to local JSON file
            if (!scores || scores.length === 0) {
                scores = await this.fetchFromLocal();
            }

            this.displayScores(scores);
        } catch (error) {
            console.error('Error loading scores:', error);
            this.displayError();
        }
    }

    async fetchFromFunction() {
        try {
            const response = await fetch('/.netlify/functions/fetch-scores');
            const data = await response.json();

            if (data.success && data.scores) {
                this.updateLastUpdated(data.lastUpdated);
                return data.scores;
            }
            return [];
        } catch (error) {
            console.log('Function not available, using local data');
            return [];
        }
    }

    async fetchFromLocal() {
        try {
            const response = await fetch('/data/scores.json');
            const data = await response.json();
            this.updateLastUpdated(data.lastUpdated);
            return data.scores || [];
        } catch (error) {
            console.error('Error loading local scores:', error);
            return [];
        }
    }

    displayScores(scores) {
        if (!this.scoresContainer) return;

        if (scores.length === 0) {
            this.scoresContainer.innerHTML = `
                <div class="no-scores">
                    <p>No recent scores available. Check back later!</p>
                </div>
            `;
            return;
        }

        // Group scores by sport
        const scoresBySport = this.groupBySport(scores);

        let html = '';
        for (const [sport, sportScores] of Object.entries(scoresBySport)) {
            html += `
                <div class="sport-section">
                    <h3 class="sport-title">${this.getSportIcon(sport)} ${sport}</h3>
                    <div class="scores-list">
                        ${sportScores.map(score => this.createScoreCard(score)).join('')}
                    </div>
                </div>
            `;
        }

        this.scoresContainer.innerHTML = html;
    }

    createScoreCard(score) {
        const homeLogoPath = this.getSchoolLogo(score.homeTeam);
        const awayLogoPath = this.getSchoolLogo(score.awayTeam);

        return `
            <div class="score-card">
                <div class="score-date">${score.date}</div>
                <div class="score-matchup">
                    <div class="team away-team">
                        <img src="${awayLogoPath}" alt="${score.awayTeam}" class="team-logo">
                        <span class="team-name">${score.awayTeam}</span>
                        <span class="team-score">${score.awayScore}</span>
                    </div>
                    <div class="score-divider">@</div>
                    <div class="team home-team">
                        <img src="${homeLogoPath}" alt="${score.homeTeam}" class="team-logo">
                        <span class="team-name">${score.homeTeam}</span>
                        <span class="team-score">${score.homeScore}</span>
                    </div>
                </div>
            </div>
        `;
    }

    groupBySport(scores) {
        return scores.reduce((groups, score) => {
            const sport = score.sport || 'Other';
            if (!groups[sport]) {
                groups[sport] = [];
            }
            groups[sport].push(score);
            return groups;
        }, {});
    }

    getSchoolLogo(schoolName) {
        // Convert school name to logo filename
        const normalized = schoolName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return `images/logos/${normalized}.png`;
    }

    getSportIcon(sport) {
        const icons = {
            'Boys Basketball': '🏀',
            'Girls Basketball': '🏀',
            'Boys Wrestling': '🤼',
            'Girls Wrestling': '🤼',
            'Boys Ice Hockey': '🏒',
            'Girls Ice Hockey': '🏒',
            'Boys Fencing': '🤺',
            'Girls Fencing': '🤺',
            'Bowling': '🎳'
        };
        return icons[sport] || '🏆';
    }

    updateLastUpdated(timestamp) {
        if (!this.lastUpdatedEl) return;

        const date = new Date(timestamp);
        const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        this.lastUpdatedEl.textContent = `Last updated: ${formatted}`;
    }

    displayError() {
        if (!this.scoresContainer) return;

        this.scoresContainer.innerHTML = `
            <div class="scores-error">
                <p>Unable to load scores at this time. Please try again later.</p>
            </div>
        `;
    }

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-scores');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.disabled = true;
                refreshBtn.textContent = 'Refreshing...';

                this.loadScores().then(() => {
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = 'Refresh Scores';
                });
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScoresDisplay();
    });
} else {
    new ScoresDisplay();
}
