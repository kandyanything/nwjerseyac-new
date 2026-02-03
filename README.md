# Northwest Jersey Athletic Conference Website

This is the official website for the Northwest Jersey Athletic Conference (NJAC), featuring athletic schedules for all 39 member schools via Arbiter Live.

## Overview

The NJAC website provides:
- Links to Arbiter Live schedules for all 39 member schools
- Conference calendar with schedules organized by sport
- Directory of member school websites
- External links to athletic associations (NJSIAA, DAANJ, NFHS, etc.)
- Conference information and resources

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Styling:** Custom CSS with responsive design
- **Data:** JSON data file for school information
- **Hosting:** Netlify (recommended)
- **Schedule Platform:** Arbiter Live

## Project Structure

```
nwjerseyac-new/
├── index.html              # Homepage
├── schools.html            # Member schools with Arbiter Live links
├── calendar.html           # Conference calendar by sport
├── websites.html           # School websites directory
├── links.html              # External resources
├── info.html               # Conference information
├── css/
│   └── styles.css          # All styling
├── js/
│   └── main.js             # JavaScript functionality
├── images/
│   └── njac-logo.png       # Conference logo
├── data/
│   ├── schools.json        # School data with Arbiter URLs
│   └── schools-arbiter.csv # Source data from spreadsheet
└── README.md               # This file
```

## Features

### Responsive Design
- Mobile-friendly navigation
- Responsive grid layouts
- Works on all devices (desktop, tablet, mobile)

### School Schedules
- 37 out of 39 schools have working Arbiter Live links
- Dover High School: Schedule coming soon
- Vernon Township High School: Schedule coming soon

### Color Scheme
- Primary: Blue (#1e3a8a, #3b82f6, #1e40af)
- Secondary: Gray (#4b5563, #6b7280, #9ca3af)
- Background: Light gray (#f6f6f6)

## Deployment

### Local Testing
1. Open `index.html` in a web browser
2. Navigate through all pages to test links
3. Test responsive design on different screen sizes

### Netlify Deployment
1. Create a GitHub repository
2. Push code to GitHub
3. Connect repository to Netlify
4. Configure custom domain (if applicable)
5. Deploy

## Maintenance

### Updating School Arbiter Live URLs

Edit `data/schools.json` to update Arbiter Live URLs:

```json
{
  "name": "School Name",
  "website": "http://schoolwebsite.com",
  "arbiterEntityId": "12345",
  "arbiterUrl": "https://arbiterlive.com/Teams?entityId=12345"
}
```

### Adding Missing Schools

To add Arbiter Live URLs for Dover and Vernon Township:
1. Find their Arbiter Live entity IDs
2. Update `data/schools.json`
3. Update `schools.html` to replace "Schedule Coming Soon" with actual links
4. Redeploy

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2026 Northwest Jersey Athletic Conference. All rights reserved.

## Contact

For questions or updates, contact your school's athletic director or NJAC conference administration.

## Migration Notes

This website replaces the previous rSchoolToday-based site (www.nwjerseyac.com) which is being shut down at the end of June 2026. All schedules have been migrated to Arbiter Live.
