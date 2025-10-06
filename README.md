# TrailBites

A GitHub Pages project that displays trail locations on an interactive map using the Google Maps API and CSV data.

## Features

- 🗺️ Interactive Google Maps integration
- 📄 CSV data parsing for trail locations
- 📍 Custom markers with detailed information windows
- 📱 Responsive design for mobile and desktop
- 🎨 Clean, modern UI with trail-themed styling

## Setup Instructions

### 1. Google Maps API Key (Secure Setup)

To use this project securely:

#### Option A: GitHub Actions (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable "Maps JavaScript API"
3. Create an API key and restrict it to your GitHub Pages domain
4. Go to your GitHub repository Settings > Secrets and variables > Actions
5. Add a new secret named `GOOGLE_MAPS_API_KEY` with your API key
6. The GitHub Actions workflow will automatically inject it during deployment

#### Option B: Local Configuration
1. Copy `config.js` to your local environment
2. Replace `YOUR_API_KEY_HERE` with your actual API key
3. Add `config.js` to `.gitignore` (already done)
4. **Never commit your API key to the repository**

#### API Key Security (Critical!)
1. In Google Cloud Console, restrict your API key:
   - **Application restrictions**: HTTP referrers
   - **Allowed referrers**: `https://yourusername.github.io/*`
   - **API restrictions**: Maps JavaScript API only

### 2. GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select source: "Deploy from a branch"
4. Choose branch: `main` (or `master`)
5. Select folder: `/ (root)`
6. Click Save

Your site will be available at: `https://yourusername.github.io/repositoryname`

### 3. CSV Data Format

The `data/trails.csv` file should follow this format:

```csv
name,latitude,longitude,description,difficulty,length,type,rating,features
Trail Name,40.7128,-74.0060,"Description here",Easy,2.5 miles,Hiking,4.5,"Feature1, Feature2"
```

Required fields:
- `name`: Trail name
- `latitude`: Decimal latitude
- `longitude`: Decimal longitude

Optional fields:
- `description`: Trail description
- `difficulty`: Difficulty level
- `length`: Trail length
- `type`: Trail type (Hiking, Walking, etc.)
- `rating`: Star rating
- `features`: Comma-separated features

## Local Development

To run locally:

1. Clone the repository
2. Start a local server (Python example):
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

Note: You'll need a local server due to CORS restrictions when loading CSV files.

## File Structure

```
├── index.html          # Main HTML page
├── styles.css          # Stylesheet
├── csvParser.js        # CSV parsing utilities
├── mapHandler.js       # Google Maps integration
├── data/
│   └── trails.csv      # Trail data
└── README.md           # This file
```

## Customization

### Adding New Trails

Edit `data/trails.csv` to add new trail locations. The map will automatically load and display all valid entries.

### Styling

Modify `styles.css` to change the appearance. The current theme uses green colors appropriate for outdoor/trail themes.

### Map Configuration

In `mapHandler.js`, you can modify:
- Default map center and zoom level
- Map type (terrain, satellite, etc.)
- Marker icons and styling
- Info window content

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source. Feel free to modify and distribute.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Map Not Loading
- Check that your Google Maps API key is valid
- Ensure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for error messages

### CSV Data Not Loading
- Verify the CSV file path is correct
- Ensure the CSV format matches the expected structure
- Check for CORS issues if running locally

### Markers Not Appearing
- Verify latitude/longitude values are valid numbers
- Check that coordinates are within valid ranges (-90 to 90 for lat, -180 to 180 for lng)
- Look for console warnings about invalid data

### CSV Updates Not Showing
- The project uses cache-busting techniques to prevent CSV caching
- If updates still don't appear, try:
  - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
  - Clear browser cache
  - Wait a few minutes for GitHub Pages to update
  - Update the version in `data/version.json` when making changes

## Cache Management

To ensure CSV updates are reflected immediately:

1. **Automatic Cache Busting**: The app automatically appends timestamps to CSV requests
2. **Version Control**: Update `data/version.json` when making significant changes
3. **Manual Cache Clear**: Users can force reload with Ctrl+F5

When updating trail data:
1. Edit `data/trails.csv`
2. Update version in `data/version.json`
3. Commit and push changes
4. GitHub Pages will update within a few minutes
