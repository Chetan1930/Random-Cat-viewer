# Random Cat Viewer

A simple web app that fetches and displays random cat images with basic cat details.

## Features

- Fetches random cat data from the FreeAPI public cats endpoint
- Shows cat image, ID, breed name, and description/temperament
- Displays a loading overlay while data and image are being prepared
- Prefetches the next cat in the background for faster button clicks
- **NEW:** Favorite cats and view them in a gallery
- **NEW:** Cat viewing counter
- **NEW:** Keyboard support (press Space or Enter for new cat)
- Handles failures with a fallback placeholder image and error message

## Project Structure

- `index.html` - app markup
- `style.css` - app styling
- `logic.js` - fetch/render logic and loading state handling

## Run Locally

No build tools are required. Open the project directly in a browser.

### Option 1: Open file directly

Open `index.html` in your browser.

### Option 2: Use a local static server (recommended)

If you have Python installed:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## API Used

- Endpoint: `https://api.freeapi.app/api/v1/public/cats/cat/random`

## Recent Fixes and Improvements

- Fixed loader so it disappears only after image is ready to display
- Added robust image URL extraction (`image.url`, `image`, or `url`)
- Added next-item prefetching to improve perceived speed
- Added favorite functionality with localStorage persistence
- Added favorites gallery view
- Added cat viewing counter
- Added keyboard shortcuts for better UX
- Improved button layout and styling
