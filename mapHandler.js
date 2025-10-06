// Global variables
let map;
let markers = [];
let infoWindow;

// Initialize the Google Map
function initMap() {
    // Clear any initial loading content
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = '';
    }
    
    // Default center (can be changed based on your data)
    const defaultCenter = { lat: 40.0244751, lng: -75.2311484 }; // Philly

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: 'terrain',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    infoWindow = new google.maps.InfoWindow();
    
    console.log('Map initialized successfully');
    
    // Automatically load trail data when map is ready
    loadTrailData();
}

// Load trail data and display on map
async function loadTrailData() {
    const loadButton = document.getElementById('loadData');
    const info = document.getElementById('info');
    const mapElement = document.getElementById('map');
    
    try {
        // Update UI elements if they exist
        if (loadButton) {
            loadButton.disabled = true;
            loadButton.textContent = 'Loading...';
        }
        if (info) {
            info.textContent = 'Loading trail data...';
        }
        if (mapElement) {
            mapElement.classList.add('loading');
        }
        
        // Clear existing markers
        clearMarkers();
        
        // Load data from CSV file
        const trailData = await loadCSVData('data/trails.csv');
        
        if (trailData.length === 0) {
            throw new Error('No valid trail data found');
        }
        
        // Add markers to map
        addMarkersToMap(trailData);
        
        // Fit map to show all markers
        fitMapToMarkers();
        
        if (info) {
            info.textContent = `Loaded ${trailData.length} trail locations. Click markers for details.`;
        }
        
        // Show the legend after data is loaded
        const legend = document.getElementById('legend');
        if (legend) {
            legend.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading trail data:', error);
        if (info) {
            info.textContent = `Error loading data: ${error.message}`;
        }
        // Only show alert if this is a manual reload (button exists and was clicked)
        if (loadButton && loadButton.disabled) {
            alert(`Failed to load trail data: ${error.message}`);
        }
    } finally {
        if (loadButton) {
            loadButton.disabled = false;
            loadButton.textContent = 'Reload Trail Data';
        }
        if (mapElement) {
            mapElement.classList.remove('loading');
        }
    }
}

// Get marker color based on difficulty (1-5 scale, green to blue)
function getMarkerColor(difficulty) {
    const diff = parseInt(difficulty) || 1; // Default to 1 if invalid
    
    switch(diff) {
        case 1: return 'green';     // Easy - Green
        case 2: return 'ltblue';    // Easy-Medium - Light Blue  
        case 3: return 'yellow';    // Medium - Yellow
        case 4: return 'orange';    // Medium-Hard - Orange
        case 5: return 'blue';      // Hard - Blue
        default: return 'green';    // Default to green
    }
}

// Get marker icon URL based on difficulty
function getMarkerIcon(difficulty) {
    const color = getMarkerColor(difficulty);
    return {
        url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        scaledSize: new google.maps.Size(32, 32)
    };
}

// Get difficulty text description
function getDifficultyText(difficulty) {
    const diff = parseInt(difficulty) || 1;
    
    switch(diff) {
        case 1: return 'Very Easy';
        case 2: return 'Easy';
        case 3: return 'Moderate';
        case 4: return 'Difficult';
        case 5: return 'Very Difficult';
        default: return 'Easy';
    }
}

// Get display color for difficulty text (different from marker color for better readability)
function getDifficultyDisplayColor(markerColor) {
    switch(markerColor) {
        case 'green': return '#2e7d2e';
        case 'ltblue': return '#1e90ff';
        case 'yellow': return '#ff8c00';
        case 'orange': return '#ff4500';
        case 'blue': return '#0066cc';
        default: return '#2e7d2e';
    }
}

// Add markers to the map
function addMarkersToMap(trailData) {
    trailData.forEach((trail, index) => {
        const marker = new google.maps.Marker({
            position: { lat: trail.latitude, lng: trail.longitude },
            map: map,
            title: trail.name,
            icon: getMarkerIcon(trail.difficulty)
        });

        // Create info window content
        const infoContent = createInfoWindowContent(trail);
        
        // Add click listener to marker
        marker.addListener('click', () => {
            infoWindow.setContent(infoContent);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });
    
    console.log(`Added ${markers.length} markers to map`);
}

// Create content for info window
function createInfoWindowContent(trail) {
    const content = document.createElement('div');
    content.style.maxWidth = '300px';
    
    const title = document.createElement('h3');
    title.textContent = trail.name;
    title.style.margin = '0 0 10px 0';
    title.style.color = '#2c5f2d';
    content.appendChild(title);
    
    // Add available trail information
    const fields = [
        { key: 'description', label: 'Description' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'trail', label: 'Trail Name' },
        { key: 'comments', label: 'Commens' }
    ];
    
    fields.forEach(field => {
        if (trail[field.key] && trail[field.key].trim()) {
            const div = document.createElement('div');
            
            // Special handling for difficulty to show color coding
            if (field.key === 'difficulty') {
                const difficultyValue = parseInt(trail[field.key]) || 1;
                const color = getMarkerColor(difficultyValue);
                const difficultyText = getDifficultyText(difficultyValue);
                
                div.innerHTML = `<strong>${field.label}:</strong> <span style="color: ${getDifficultyDisplayColor(color)}; font-weight: bold;">${difficultyValue} - ${difficultyText}</span>`;
            } else {
                div.innerHTML = `<strong>${field.label}:</strong> ${trail[field.key]}`;
            }
            
            div.style.marginBottom = '5px';
            content.appendChild(div);
        }
    });
    
    // Add coordinates
    const coords = document.createElement('div');
    coords.innerHTML = `<small>Coordinates: ${trail.latitude.toFixed(6)}, ${trail.longitude.toFixed(6)}</small>`;
    coords.style.marginTop = '10px';
    coords.style.color = '#666';
    content.appendChild(coords);
    
    return content;
}

// Clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
    
    if (infoWindow) {
        infoWindow.close();
    }
}

// Fit map view to show all markers
function fitMapToMarkers() {
    if (markers.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    markers.forEach(marker => {
        bounds.extend(marker.getPosition());
    });
    
    map.fitBounds(bounds);
    
    // Ensure minimum zoom level
    google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) {
            map.setZoom(15);
        }
    });
}

// Handle map loading errors
window.gm_authFailure = function() {
    const mapElement = document.getElementById('map');
    mapElement.innerHTML = `
        <div style="padding: 40px; text-align: center; background: #ffebee; color: #c62828; border-radius: 8px;">
            <h3>Google Maps API Error</h3>
            <p>Please check your API key configuration.</p>
            <p>Replace "YOUR_API_KEY_HERE" in index.html with a valid Google Maps API key.</p>
        </div>
    `;
};
