const https = require('https');
const cheerio = require('cheerio');

// NJAC member schools
const NJAC_SCHOOLS = [
  'Academy of Saint Elizabeth', 'Boonton', 'Butler', 'Chatham', 'Delbarton',
  'Dover', 'Hackettstown', 'Hanover Park', 'High Point', 'Hopatcong',
  'Jefferson', 'Kinnelon', 'Kittatinny', 'Lenape Valley', 'Madison',
  'Montville', 'Morris Catholic', 'Morris County School of Technology',
  'Morris Hills', 'Morris Knolls', 'Morristown Beard', 'Morristown',
  'Mount Olive', 'Mountain Lakes', 'Newton', 'North Warren', 'Parsippany',
  'Parsippany Hills', 'Pequannock', 'Pope John', 'Randolph', 'Roxbury',
  'Sparta', 'Sussex County Tech', 'Vernon', 'Villa Walsh', 'Wallkill Valley',
  'West Morris Central', 'West Morris Mendham', 'Whippany Park'
];

// Sports to track
const TRACKED_SPORTS = [
  'Boys Basketball', 'Girls Basketball',
  'Boys Wrestling', 'Girls Wrestling',
  'Boys Ice Hockey', 'Girls Ice Hockey',
  'Boys Fencing', 'Girls Fencing',
  'Bowling'
];

exports.handler = async (event, context) => {
  try {
    // Attempt to fetch scores from NJ.com
    const scores = await fetchScores();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        lastUpdated: new Date().toISOString(),
        scores: scores
      })
    };
  } catch (error) {
    console.error('Error fetching scores:', error);

    // Return empty array if fetch fails
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Unable to fetch scores',
        lastUpdated: new Date().toISOString(),
        scores: []
      })
    };
  }
};

async function fetchScores() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'highschoolsports.nj.com',
      path: '/scores/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const scores = parseScores(data);
          resolve(scores);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function parseScores(html) {
  const $ = cheerio.load(html);
  const scores = [];

  // This selector will need to be adjusted based on actual site structure
  // Placeholder logic - will need to be customized
  $('.score-item, .game-item, [data-game], .matchup').each((i, elem) => {
    const $elem = $(elem);

    // Extract game information
    const homeTeam = $elem.find('.home-team, .team-home, .team1').text().trim();
    const awayTeam = $elem.find('.away-team, .team-away, .team2').text().trim();
    const homeScore = $elem.find('.home-score, .score1').text().trim();
    const awayScore = $elem.find('.away-score, .score2').text().trim();
    const sport = $elem.find('.sport, .sport-name').text().trim();
    const date = $elem.find('.date, .game-date').text().trim();

    // Check if either team is an NJAC school
    const isNJACGame = NJAC_SCHOOLS.some(school =>
      homeTeam.includes(school) || awayTeam.includes(school)
    );

    // Check if sport is tracked
    const isTrackedSport = TRACKED_SPORTS.some(trackedSport =>
      sport.toLowerCase().includes(trackedSport.toLowerCase())
    );

    if (isNJACGame && isTrackedSport && homeTeam && awayTeam) {
      scores.push({
        homeTeam,
        awayTeam,
        homeScore: homeScore || '-',
        awayScore: awayScore || '-',
        sport,
        date: date || new Date().toLocaleDateString(),
        isNJAC: isNJACGame
      });
    }
  });

  return scores;
}
