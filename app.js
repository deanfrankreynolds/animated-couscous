// Newcastle Accessible Route Planner
// Main application logic

class AccessibleRoutePlanner {
    constructor() {
        // Newcastle City Centre coordinates
        this.newcastleCenter = [54.9783, -1.6178];
        this.map = null;
        this.startMarker = null;
        this.endMarker = null;
        this.startPoint = null;
        this.endPoint = null;
        this.routeLayer = null;
        this.maxGradient = 3;

        // OpenRouteService API key
        this.apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ3MzZjMmRmMjFjYjRkZTlhYzc5NmQ2N2FkMmY4YTAxIiwiaCI6Im11cm11cjY0In0=';
        this.apiBaseUrl = 'https://api.openrouteservice.org';

        // Predefined accessible locations in Newcastle City Centre
        this.knownLocations = {
            'central station': [54.9689, -1.6174],
            'grey\'s monument': [54.9738, -1.6143],
            'greys monument': [54.9738, -1.6143],
            'monument': [54.9738, -1.6143],
            'eldon square': [54.9758, -1.6151],
            'northumberland street': [54.9748, -1.6155],
            'quayside': [54.9688, -1.6033],
            'st james park': [54.9756, -1.6217],
            'newcastle university': [54.9783, -1.6178],
            'civic centre': [54.9801, -1.6120],
            'haymarket': [54.9794, -1.6127],
            'theatre royal': [54.9730, -1.6111],
            'life science centre': [54.9690, -1.6060],
            'discovery museum': [54.9683, -1.6145],
            'castle keep': [54.9703, -1.6097],
            'laing art gallery': [54.9741, -1.6121],
            'grainger market': [54.9725, -1.6130],
            'chinatown': [54.9711, -1.6156],
            'st nicholas cathedral': [54.9703, -1.6097]
        };

        this.init();
    }

    init() {
        this.initMap();
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    initMap() {
        // Initialize Leaflet map centered on Newcastle
        this.map = L.map('map').setView(this.newcastleCenter, 14);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add click handler for map
        this.map.on('click', (e) => this.handleMapClick(e));

        // Add Newcastle City Centre boundary overlay
        this.addCityCentreBoundary();
    }

    addCityCentreBoundary() {
        // Approximate Newcastle City Centre boundary
        const cityCentre = [
            [54.9850, -1.6300],
            [54.9850, -1.6000],
            [54.9650, -1.6000],
            [54.9650, -1.6300]
        ];

        L.rectangle(cityCentre, {
            color: '#2563eb',
            weight: 2,
            fillOpacity: 0.05,
            dashArray: '5, 10'
        }).addTo(this.map);
    }

    setupEventListeners() {
        // Find Route button
        document.getElementById('find-route-btn').addEventListener('click', () => {
            this.findRoute();
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAll();
        });

        // Use Location button
        document.getElementById('use-location-btn').addEventListener('click', () => {
            this.useCurrentLocation();
        });

        // Example Route button
        document.getElementById('example-route-btn').addEventListener('click', () => {
            this.loadExampleRoute();
        });

        // Gradient selector
        document.getElementById('max-gradient').addEventListener('change', (e) => {
            this.maxGradient = parseInt(e.target.value);
        });

        // Input fields - handle Enter key
        document.getElementById('start-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.geocodeLocation('start', e.target.value);
            }
        });

        document.getElementById('end-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.geocodeLocation('end', e.target.value);
            }
        });
    }

    showWelcomeMessage() {
        console.log('Newcastle Accessible Route Planner initialized');
        console.log('Click on the map or enter locations to plan your route');
    }

    handleMapClick(e) {
        const { lat, lng } = e.latlng;

        if (!this.startPoint) {
            this.setStartPoint(lat, lng);
            this.updateInput('start-input', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } else if (!this.endPoint) {
            this.setEndPoint(lat, lng);
            this.updateInput('end-input', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            // Automatically find route when both points are set
            setTimeout(() => this.findRoute(), 300);
        } else {
            // Reset and start over
            this.clearAll();
            this.setStartPoint(lat, lng);
            this.updateInput('start-input', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
    }

    setStartPoint(lat, lng) {
        this.startPoint = [lat, lng];

        if (this.startMarker) {
            this.map.removeLayer(this.startMarker);
        }

        this.startMarker = L.marker([lat, lng], {
            icon: this.createCustomIcon('🟢', 'Start')
        }).addTo(this.map);

        this.startMarker.bindPopup('<b>Start Point</b>').openPopup();
    }

    setEndPoint(lat, lng) {
        this.endPoint = [lat, lng];

        if (this.endMarker) {
            this.map.removeLayer(this.endMarker);
        }

        this.endMarker = L.marker([lat, lng], {
            icon: this.createCustomIcon('🔴', 'End')
        }).addTo(this.map);

        this.endMarker.bindPopup('<b>End Point</b>').openPopup();
    }

    createCustomIcon(emoji, label) {
        return L.divIcon({
            html: `<div style="font-size: 24px;" title="${label}">${emoji}</div>`,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    updateInput(inputId, value) {
        document.getElementById(inputId).value = value;
    }

    async geocodeLocation(type, query) {
        const normalizedQuery = query.toLowerCase().trim();

        // Check known locations first
        if (this.knownLocations[normalizedQuery]) {
            const [lat, lng] = this.knownLocations[normalizedQuery];
            if (type === 'start') {
                this.setStartPoint(lat, lng);
            } else {
                this.setEndPoint(lat, lng);
            }
            return;
        }

        // Try to parse as coordinates (lat, lng)
        const coordMatch = query.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (lat >= 54.95 && lat <= 55.00 && lng >= -1.65 && lng <= -1.58) {
                if (type === 'start') {
                    this.setStartPoint(lat, lng);
                } else {
                    this.setEndPoint(lat, lng);
                }
                return;
            }
        }

        // Use Nominatim for geocoding
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query + ', Newcastle upon Tyne, UK')}` +
                `&format=json&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                if (type === 'start') {
                    this.setStartPoint(lat, lng);
                } else {
                    this.setEndPoint(lat, lng);
                }
            } else {
                this.showError(`Location not found: ${query}`);
            }
        } catch (error) {
            this.showError('Geocoding failed. Please try coordinates or a known location.');
        }
    }

    async findRoute() {
        if (!this.startPoint || !this.endPoint) {
            this.showError('Please select both start and end points');
            return;
        }

        this.hideError();
        this.hideRouteInfo();

        const btn = document.getElementById('find-route-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Finding Route...';

        try {
            // Calculate route with accessibility considerations
            const route = await this.calculateAccessibleRoute();

            if (route) {
                this.displayRoute(route);
                this.showRouteInfo(route);
            } else {
                this.showError('No accessible route found. Try adjusting the maximum gradient setting.');
            }
        } catch (error) {
            console.error('Routing error:', error);
            this.showError('Error calculating route. Please try again.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Find Accessible Route';
        }
    }

    async calculateAccessibleRoute() {
        // Use OpenRouteService API for real routing with elevation data
        const [startLat, startLng] = this.startPoint;
        const [endLat, endLng] = this.endPoint;

        try {
            // OpenRouteService uses [lng, lat] format (opposite of Leaflet)
            const coordinates = [
                [startLng, startLat],
                [endLng, endLat]
            ];

            // Call OpenRouteService API with wheelchair profile
            const response = await fetch(`${this.apiBaseUrl}/v2/directions/wheelchair`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.apiKey
                },
                body: JSON.stringify({
                    coordinates: coordinates,
                    preference: 'recommended',
                    elevation: true,
                    instructions: true,
                    units: 'km',
                    extra_info: ['steepness']
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('OpenRouteService error details:', errorData);
                console.error('Request was:', {
                    coordinates: coordinates,
                    preference: 'recommended',
                    elevation: true,
                    instructions: true,
                    units: 'km',
                    extra_info: ['steepness']
                });
                throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();

            console.log('OpenRouteService response:', data);
            console.log('Routes array:', data.routes);
            if (data.routes && data.routes[0]) {
                console.log('First route:', data.routes[0]);
                console.log('Geometry:', data.routes[0].geometry);
            }

            // Parse the response and calculate gradient information
            return this.parseRouteData(data);

        } catch (error) {
            console.error('Routing error:', error);
            throw error;
        }
    }

    parseRouteData(data) {
        // Extract route information from OpenRouteService response
        console.log('parseRouteData called with:', data);

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No routes found in response');
        }

        const route = data.routes[0];
        console.log('Route object:', route);
        console.log('Elevation data available:', route.elevation);
        console.log('Extras:', route.extras);

        if (route.extras && route.extras.steepness) {
            console.log('Steepness values:', route.extras.steepness.values);
            console.log('Steepness summary:', route.extras.steepness.summary);
        }

        console.log('Summary:', route.summary);

        // OpenRouteService returns encoded geometry, we need to decode it
        let coordinates;
        if (route.geometry) {
            if (typeof route.geometry === 'string') {
                // Geometry is encoded polyline - need to decode
                console.log('Geometry is encoded, needs decoding');
                coordinates = this.decodePolyline(route.geometry);
            } else if (route.geometry.coordinates) {
                coordinates = route.geometry.coordinates;
            } else {
                throw new Error('Unknown geometry format');
            }
        } else {
            throw new Error('No geometry in route response');
        }

        const segments = route.segments[0];
        console.log('Segments:', segments);
        console.log('Steps:', segments.steps);
        if (segments.steps.length > 0) {
            console.log('First step:', segments.steps[0]);
        }

        // Convert coordinates to Leaflet format [lat, lng]
        const points = coordinates.map(coord => [coord[1], coord[0]]);

        // Get elevation data from route.elevation if available
        let elevations = [];
        if (route.elevation && route.elevation.length > 0) {
            elevations = route.elevation;
            console.log('Using elevation data from route.elevation:', elevations.length, 'points');
        } else {
            // Fallback: use coordinates if they have elevation, or zeros
            elevations = coordinates.map(coord => coord[2] || 0);
            console.log('Using elevation from coordinates or zeros');
        }

        // Calculate gradients between consecutive points
        const gradientSegments = [];
        let maxSegmentGradient = 0;
        let isAccessible = true;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const e1 = elevations[i];
            const e2 = elevations[i + 1];

            const segmentDistance = this.calculateDistance(p1, p2) * 1000; // meters
            const elevationChange = e2 - e1;
            const gradient = segmentDistance > 0 ? Math.abs((elevationChange / segmentDistance) * 100) : 0;

            gradientSegments.push({
                start: p1,
                end: p2,
                gradient: gradient,
                elevationChange: elevationChange
            });

            maxSegmentGradient = Math.max(maxSegmentGradient, gradient);

            if (gradient > this.maxGradient) {
                isAccessible = false;
            }
        }

        // Extract turn-by-turn instructions
        const directions = segments.steps.map((step, index) => {
            // Format distance - step.distance is already in km, convert to meters
            const distanceInMeters = step.distance * 1000;
            let distanceStr;
            if (distanceInMeters < 1000) {
                distanceStr = Math.round(distanceInMeters) + ' m';
            } else {
                distanceStr = (distanceInMeters / 1000).toFixed(2) + ' km';
            }

            return {
                instruction: step.instruction,
                distance: distanceStr,
                duration: Math.ceil(step.duration / 60) + ' min',
                type: step.type,
                name: step.name || 'Unnamed road'
            };
        });

        // Use actual elevation data from summary if available
        const totalElevationGain = route.summary.ascent || gradientSegments.reduce((sum, seg) =>
            sum + (seg.elevationChange > 0 ? seg.elevationChange : 0), 0
        );

        // Calculate max gradient from steepness data
        // OpenRouteService steepness categories: 0=flat(0-3%), 1=gentle(3-6%), 2=moderate(6-10%), 3=steep(10-15%), 4=very steep(>15%)
        let calculatedMaxGradient = maxSegmentGradient;

        if (route.extras && route.extras.steepness && route.extras.steepness.values) {
            const steepnessCategories = route.extras.steepness.values;
            const maxCategory = Math.max(...steepnessCategories.map(seg => seg[2]));

            // Map category to gradient percentage (use upper bound of each range)
            const categoryToGradient = [3, 6, 10, 15, 20];
            if (maxCategory >= 0 && maxCategory < categoryToGradient.length) {
                calculatedMaxGradient = categoryToGradient[maxCategory];
                console.log(`Steepness category ${maxCategory} = max ${calculatedMaxGradient}% gradient`);
            }
        }

        // Check accessibility based on calculated gradient
        const routeIsAccessible = calculatedMaxGradient <= this.maxGradient;

        // Process steepness segments for detailed gradient breakdown
        const steepnessSegments = this.processSteepnessSegments(route.extras?.steepness?.values || [], points);

        return {
            points: points,
            segments: gradientSegments,
            distance: route.summary.distance * 1000, // Convert to meters
            duration: Math.ceil(route.summary.duration / 60), // Convert to minutes
            maxGradient: calculatedMaxGradient,
            isAccessible: routeIsAccessible,
            elevationGain: totalElevationGain,
            estimatedTime: Math.ceil(route.summary.duration / 60),
            directions: directions,
            steepnessSegments: steepnessSegments,
            rawData: route
        };
    }

    processSteepnessSegments(steepnessValues, points) {
        // Convert steepness segments to useful data with distances        // steepnessValues format: [[startIndex, endIndex, category], ...]
        const categoryNames = ['Flat (0-3%)', 'Gentle (3-6%)', 'Moderate (6-10%)', 'Steep (10-15%)', 'Very Steep (>15%)'];
        const categoryGradients = [3, 6, 10, 15, 20];
        const categoryColors = ['#10b981', '#84cc16', '#f59e0b', '#ef4444', '#991b1b'];

        return steepnessValues.map(segment => {
            const [startIdx, endIdx, category] = segment;

            // Calculate distance for this segment
            let segmentDistance = 0;
            for (let i = startIdx; i < endIdx && i < points.length - 1; i++) {
                segmentDistance += this.calculateDistance(points[i], points[i + 1]) * 1000; // in meters
            }

            return {
                startIndex: startIdx,
                endIndex: endIdx,
                category: category,
                categoryName: categoryNames[category] || 'Unknown',
                maxGradient: categoryGradients[category] || 0,
                color: categoryColors[category] || '#6b7280',
                distance: segmentDistance,
                points: points.slice(startIdx, endIdx + 1)
            };
        });
    }

    decodePolyline(encoded) {
        // Decode Google-style polyline encoding
        // Returns array of [lng, lat] coordinates
        const points = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push([lng * 1e-5, lat * 1e-5]);
        }

        return points;
    }

    async simulateAccessibleRoute(start, end, maxGradient) {
        // Simulate route calculation with gradient checking
        // In a real implementation, this would call an API that provides elevation data

        const distance = this.calculateDistance(start, end);

        // Create a simple route with intermediate points
        const numPoints = Math.max(5, Math.floor(distance * 10));
        const routePoints = [];

        for (let i = 0; i <= numPoints; i++) {
            const ratio = i / numPoints;
            const lat = start[0] + (end[0] - start[0]) * ratio;
            const lng = start[1] + (end[1] - start[1]) * ratio;

            // Simulate elevation (Newcastle has hilly terrain)
            // Real implementation would fetch actual elevation data
            const elevation = this.simulateElevation(lat, lng);

            routePoints.push({ lat, lng, elevation });
        }

        // Calculate gradients between points
        const segments = [];
        let maxSegmentGradient = 0;
        let isAccessible = true;

        for (let i = 0; i < routePoints.length - 1; i++) {
            const p1 = routePoints[i];
            const p2 = routePoints[i + 1];

            const segmentDistance = this.calculateDistance([p1.lat, p1.lng], [p2.lat, p2.lng]) * 1000; // in meters
            const elevationChange = p2.elevation - p1.elevation;
            const gradient = (elevationChange / segmentDistance) * 100;

            segments.push({
                start: [p1.lat, p1.lng],
                end: [p2.lat, p2.lng],
                gradient: Math.abs(gradient),
                elevationChange
            });

            maxSegmentGradient = Math.max(maxSegmentGradient, Math.abs(gradient));

            if (Math.abs(gradient) > maxGradient) {
                isAccessible = false;
            }
        }

        const totalDistance = distance * 1000; // Convert to meters
        const totalElevationGain = segments.reduce((sum, seg) =>
            sum + (seg.elevationChange > 0 ? seg.elevationChange : 0), 0
        );

        return {
            points: routePoints.map(p => [p.lat, p.lng]),
            segments,
            distance: totalDistance,
            maxGradient: maxSegmentGradient,
            isAccessible,
            elevationGain: totalElevationGain,
            estimatedTime: this.estimateTime(totalDistance, maxSegmentGradient)
        };
    }

    simulateElevation(lat, lng) {
        // Simulate elevation based on known Newcastle topography
        // Newcastle City Centre has significant hills
        // Real implementation would use an elevation API

        // Simulate higher elevation in the north and west
        const baseElevation = 50;
        const latFactor = (lat - 54.965) * 100;
        const lngFactor = (lng + 1.615) * 50;

        // Add some randomness to simulate terrain
        const noise = (Math.sin(lat * 1000) + Math.cos(lng * 1000)) * 5;

        return baseElevation + latFactor + lngFactor + noise;
    }

    calculateDistance(point1, point2) {
        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const lat1 = point1[0] * Math.PI / 180;
        const lat2 = point2[0] * Math.PI / 180;
        const deltaLat = (point2[0] - point1[0]) * Math.PI / 180;
        const deltaLng = (point2[1] - point1[1]) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in km
    }

    estimateTime(distanceMeters, maxGradient) {
        // Estimate wheelchair travel time based on distance and gradient
        // Average wheelchair speed: 1.4 m/s on flat terrain
        const baseSpeed = 1.4; // m/s

        // Reduce speed based on gradient
        const speedReduction = Math.min(maxGradient / 10, 0.5);
        const adjustedSpeed = baseSpeed * (1 - speedReduction);

        const timeSeconds = distanceMeters / adjustedSpeed;
        return Math.ceil(timeSeconds / 60); // Return minutes
    }

    displayRoute(route) {
        // Remove existing route layer
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }

        // Create a layer group to hold all route segments
        this.routeLayer = L.layerGroup().addTo(this.map);

        // Draw color-coded segments if steepness data is available
        if (route.steepnessSegments && route.steepnessSegments.length > 0) {
            route.steepnessSegments.forEach(segment => {
                const segmentLine = L.polyline(segment.points, {
                    color: segment.color,
                    weight: 6,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(this.routeLayer);

                // Add tooltip showing gradient info
                segmentLine.bindTooltip(
                    `${segment.categoryName}<br>${Math.round(segment.distance)}m`,
                    { sticky: true }
                );
            });
        } else {
            // Fallback to single-color route
            const routeColor = route.isAccessible ? '#10b981' : '#f59e0b';
            L.polyline(route.points, {
                color: routeColor,
                weight: 6,
                opacity: 0.7,
                lineJoin: 'round'
            }).addTo(this.routeLayer);
        }

        // Add gradient indicators along the route
        this.addGradientIndicators(route);

        // Fit map to show entire route
        const bounds = L.latLngBounds(route.points);
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    addGradientIndicators(route) {
        // Add markers showing steep sections
        route.segments.forEach((segment, index) => {
            if (segment.gradient > this.maxGradient) {
                const midLat = (segment.start[0] + segment.end[0]) / 2;
                const midLng = (segment.start[1] + segment.end[1]) / 2;

                L.marker([midLat, midLng], {
                    icon: L.divIcon({
                        html: `<div style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">⚠ ${segment.gradient.toFixed(1)}%</div>`,
                        className: 'gradient-warning',
                        iconSize: [60, 30],
                        iconAnchor: [30, 15]
                    })
                }).addTo(this.map).bindPopup(
                    `<strong>Steep Section</strong><br>` +
                    `Gradient: ${segment.gradient.toFixed(1)}%<br>` +
                    `Elevation change: ${segment.elevationChange.toFixed(1)}m`
                );
            }
        });
    }

    showRouteInfo(route) {
        const routeInfoDiv = document.getElementById('route-info');
        const routeDetailsDiv = document.getElementById('route-details');

        const accessibilityIcon = route.isAccessible ? '✅' : '⚠️';
        const accessibilityText = route.isAccessible
            ? 'This route is accessible within your gradient preference'
            : 'This route has sections exceeding your gradient preference';

        // Add detailed gradient breakdown
        let gradientBreakdownHTML = '';
        if (route.steepnessSegments && route.steepnessSegments.length > 0) {
            gradientBreakdownHTML = `
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e5e7eb;">
                    <h4 style="margin-bottom: 0.75rem; color: #1f2937;">📊 Gradient Breakdown</h4>
                    <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.9rem;">
                        Understanding what you'll encounter - distances shown in meters so you know exactly what to expect:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${route.steepnessSegments.map(seg => {
                            const isAccessible = seg.maxGradient <= this.maxGradient;
                            const icon = isAccessible ? '✅' : '⚠️';
                            const borderColor = seg.color;

                            return `
                                <div style="padding: 0.75rem; border-left: 4px solid ${borderColor}; background: ${borderColor}15; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                        <strong style="color: #1f2937;">${icon} ${seg.categoryName}</strong>
                                        <span style="font-weight: 600; color: ${borderColor};">${Math.round(seg.distance)}m</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: #6b7280;">
                                        ${isAccessible ?
                                            `Within your ${this.maxGradient}% preference` :
                                            `Exceeds your ${this.maxGradient}% preference - may need assistance`
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        let directionsHTML = '';
        if (route.directions && route.directions.length > 0) {
            directionsHTML = `
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e5e7eb;">
                    <h4 style="margin-bottom: 0.75rem; color: #1f2937;">📍 Turn-by-Turn Directions</h4>
                    <ol style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
                        ${route.directions.map((dir, index) => `
                            <li style="margin: 0.5rem 0;">
                                <strong>${dir.instruction}</strong>
                                ${dir.name !== 'Unnamed road' ? `<br><span style="color: #6b7280; font-size: 0.9rem;">on ${dir.name}</span>` : ''}
                                <br><span style="color: #6b7280; font-size: 0.85rem;">${dir.distance} · ${dir.duration}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            `;
        }

        routeDetailsDiv.innerHTML = `
            <p><strong>${accessibilityIcon} ${accessibilityText}</strong></p>
            <p>📏 <strong>Distance:</strong> ${(route.distance / 1000).toFixed(2)} km (${(route.distance / 1000 * 0.621371).toFixed(2)} miles)</p>
            <p>⏱️ <strong>Estimated Time:</strong> ${route.estimatedTime} minutes</p>
            <p>📈 <strong>Maximum Gradient:</strong> ${route.maxGradient.toFixed(1)}%</p>
            <p>⛰️ <strong>Total Elevation Gain:</strong> ${route.elevationGain.toFixed(1)} meters</p>
            <p>♿ <strong>Your Max Gradient Setting:</strong> ${this.maxGradient}%</p>
            ${gradientBreakdownHTML}
            ${directionsHTML}
        `;

        routeInfoDiv.style.display = 'block';
    }

    hideRouteInfo() {
        document.getElementById('route-info').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        const btn = document.getElementById('use-location-btn');
        btn.disabled = true;
        btn.textContent = '📍 Getting Location...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.setStartPoint(latitude, longitude);
                this.updateInput('start-input', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                this.map.setView([latitude, longitude], 15);

                btn.disabled = false;
                btn.textContent = '📍 Use My Location';
            },
            (error) => {
                this.showError('Unable to get your location. Please check permissions.');
                btn.disabled = false;
                btn.textContent = '📍 Use My Location';
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    loadExampleRoute() {
        // Load an example route: Central Station → Grey's Monument
        this.clearAll();

        const btn = document.getElementById('example-route-btn');
        btn.disabled = true;
        btn.textContent = '🎯 Loading Example...';

        // Set Central Station as start
        const centralStation = this.knownLocations['central station'];
        this.setStartPoint(centralStation[0], centralStation[1]);
        this.updateInput('start-input', 'Central Station');

        // Set Grey's Monument as end
        const greysMonument = this.knownLocations['monument'];
        this.setEndPoint(greysMonument[0], greysMonument[1]);
        this.updateInput('end-input', 'Grey\'s Monument');

        // Automatically find the route
        setTimeout(() => {
            this.findRoute().finally(() => {
                btn.disabled = false;
                btn.textContent = '🎯 Try Example Route';
            });
        }, 500);
    }

    clearAll() {
        // Remove markers
        if (this.startMarker) {
            this.map.removeLayer(this.startMarker);
            this.startMarker = null;
        }
        if (this.endMarker) {
            this.map.removeLayer(this.endMarker);
            this.endMarker = null;
        }

        // Remove route
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }

        // Clear state
        this.startPoint = null;
        this.endPoint = null;

        // Clear inputs
        document.getElementById('start-input').value = '';
        document.getElementById('end-input').value = '';

        // Hide messages
        this.hideError();
        this.hideRouteInfo();

        // Reset map view
        this.map.setView(this.newcastleCenter, 14);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AccessibleRoutePlanner();
});
