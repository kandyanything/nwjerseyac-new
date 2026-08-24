# NJAC Scores System

## Overview
Automated system to fetch and display recent game scores for NJAC member schools.

## How It Works

### Automatic Fetching (Option 1)
1. Netlify Function attempts to scrape scores from highschoolsports.nj.com
2. Filters for NJAC schools only
3. Displays scores with school logos and sport information
4. Updates automatically when deployed

### Manual Entry (Option 2 - Fallback)
If automatic fetching doesn't work, you can manually update scores:

1. Edit `/data/scores.json`
2. Add new scores in this format:

```json
{
  "lastUpdated": "2026-02-05",
  "scores": [
    {
      "homeTeam": "Morris Knolls",
      "awayTeam": "Sparta",
      "homeScore": "65",
      "awayScore": "58",
      "sport": "Boys Basketball",
      "date": "Feb 4, 2026"
    },
    {
      "homeTeam": "Pequannock",
      "awayTeam": "Mount Olive",
      "homeScore": "45",
      "awayScore": "52",
      "sport": "Girls Basketball",
      "date": "Feb 4, 2026"
    }
  ]
}
```

3. Commit and push to update the site

## Tracked Sports
- Boys Basketball
- Girls Basketball
- Boys Wrestling
- Girls Wrestling
- Boys Ice Hockey
- Girls Ice Hockey
- Boys Fencing
- Girls Fencing
- Bowling

## NJAC Schools
All 39 member schools are automatically filtered and displayed with their logos.

## Setup Requirements

### For Automatic Scraping
1. Deploy to Netlify
2. Install dependencies: `npm install cheerio`
3. Function will run at `/.netlify/functions/fetch-scores`

### For Manual Updates
1. Just edit `/data/scores.json`
2. No additional setup required

## Future Enhancements
- Scheduled updates (daily scraping)
- Admin interface for manual entry
- Live score updates
- Historical scores archive
- Team statistics
