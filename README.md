# ♿ Newcastle Accessible Route Planner

A web application designed to help wheelchair users navigate around Newcastle City Centre by finding routes that respect wheelchair-accessible gradients.

## Features

- 🗺️ **Interactive Map** - Click to select start and end points
- 📍 **Location Search** - Enter addresses or known Newcastle landmarks
- 📱 **Current Location** - Use your device's GPS to set your starting point
- 📊 **Gradient Analysis** - Routes calculated with configurable maximum gradient settings
- ⚠️ **Visual Warnings** - Steep sections highlighted on the map
- ♿ **Accessibility Ratings** - Clear information about route accessibility
- 📏 **Detailed Information** - Distance, time estimates, and elevation data

## Getting Started

### Installation

No installation required! Simply open `index.html` in a web browser:

```bash
# Clone or download this repository
cd animated-couscous

# Open in browser (on Linux)
xdg-open index.html

# Or on Mac
open index.html

# Or on Windows
start index.html
```

Alternatively, you can serve it with any local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Then visit http://localhost:8000
```

## How to Use

### Method 1: Click on Map
1. Click on the map to set your **start point** (green marker)
2. Click again to set your **end point** (red marker)
3. The route will automatically calculate

### Method 2: Enter Locations
1. Type a location in the **Start Point** field (press Enter)
2. Type a location in the **End Point** field (press Enter)
3. Click **Find Accessible Route**

### Method 3: Use Current Location
1. Click **📍 Use My Location** to set your current position as start
2. Select your destination
3. Click **Find Accessible Route**

### Known Locations

You can search for these Newcastle landmarks:
- Central Station
- Grey's Monument / Monument
- Eldon Square
- Northumberland Street
- Quayside
- St James Park
- Newcastle University
- Civic Centre
- Haymarket
- Theatre Royal
- Life Science Centre
- Discovery Museum
- Castle Keep
- Laing Art Gallery
- Grainger Market
- Chinatown
- St Nicholas Cathedral

### Gradient Settings

Choose your maximum gradient preference:

- **3% - Most Accessible** (recommended for manual wheelchairs)
  - Suitable for independent wheelchair use
  - Complies with accessibility standards

- **5% - Moderately Accessible**
  - May require assistance for some users
  - Suitable for powered wheelchairs

- **8% - Challenging**
  - Only suitable for powered wheelchairs
  - May be difficult for some users

## Understanding Routes

### Route Colors
- **Green** 🟢 - Route is accessible within your gradient preference
- **Orange** 🟠 - Route has sections exceeding your preference

### Warning Markers
- **⚠️ Red markers** show steep sections with gradient percentage
- Click markers for detailed information

### Route Information Panel
- ✅ Accessibility status
- 📏 Total distance
- ⏱️ Estimated travel time
- 📈 Maximum gradient encountered
- ⛰️ Total elevation gain

## Technical Details

### Built With
- **Leaflet.js** - Interactive maps
- **OpenStreetMap** - Map tiles and data
- **Nominatim** - Geocoding service
- Pure HTML, CSS, and JavaScript - No build process required

### Current Implementation

The current version uses **simulated elevation data** for demonstration purposes. The gradient calculations are based on Newcastle's known topography but are approximations.

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with JavaScript enabled

## Limitations & Disclaimer

⚠️ **Important:** This tool provides guidance based on terrain data and should be used as a planning aid only.

**Always:**
- Assess routes in person before using them
- Consider current weather conditions
- Check for temporary obstacles (construction, events)
- Evaluate surface quality and width
- Consider your personal capabilities and comfort level
- Plan alternative routes

**Current Limitations:**
- Elevation data is simulated (real-world implementation would use elevation APIs)
- Does not account for:
  - Pavement quality
  - Obstacles (bollards, street furniture)
  - Temporary closures
  - Weather conditions
  - Kerb heights
  - Accessible crossings
  - Surface types

## Future Improvements

See the "Possible Improvements" section below for planned enhancements.

## Contributing

Contributions welcome! This is a community tool designed to improve accessibility in Newcastle.

## License

Open source - feel free to adapt for your city!

---

## Possible Improvements

### 1. Real Elevation Data
- Integrate with elevation APIs (SRTM, OpenElevation, Google Elevation API)
- Calculate accurate gradients from real terrain data

### 2. Accessibility Features Database
- Dropped kerbs locations
- Accessible pedestrian crossings
- Accessible toilets
- Rest areas with seating
- Accessible parking locations
- Building access information

### 3. Surface Quality Data
- Pavement conditions
- Surface types (smooth, cobbled, uneven)
- Width measurements

### 4. User Contributions
- Allow users to report obstacles
- Rate route accessibility
- Add photos of problem areas
- Share accessibility notes

### 5. Advanced Routing Options
- Avoid busy roads
- Prefer covered routes (weather protection)
- Include/exclude specific areas
- Scenic vs. direct routes
- Public transport integration

### 6. Offline Capabilities
- Download routes for offline use
- Cache map tiles
- Progressive Web App (PWA) support

### 7. Integration with Existing Services
- OpenRouteService API with wheelchair profile
- Google Maps Accessibility features
- Local council data feeds

### 8. Enhanced UI/UX
- Dark mode
- Voice guidance
- Multiple language support
- Print-friendly route cards
- Share routes via link

### 9. Accessibility Enhancements
- Screen reader optimization
- High contrast mode
- Keyboard navigation
- Customizable text sizes

### 10. Data Accuracy
- Real-time obstacle reporting
- Integration with council roadworks data
- Weather-based recommendations
- Seasonal considerations
