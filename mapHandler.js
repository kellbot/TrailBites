// Global variables
let map;
let markers = [];
let infoWindow;

// Initialize the Google Map
function initMap() {
    // Default center (can be changed based on your data)
    const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of USA
    
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
}

// Load trail data and display on map
async function loadTrailData() {
    const loadButton = document.getElementById('loadData');
    const info = document.getElementById('info');
    
    try {
        loadButton.disabled = true;
        loadButton.textContent = 'Loading...';
        info.textContent = 'Loading trail data...';
        
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
        
        info.textContent = `Loaded ${trailData.length} trail locations. Click markers for details.`;
        
    } catch (error) {
        console.error('Error loading trail data:', error);
        info.textContent = `Error loading data: ${error.message}`;
        alert(`Failed to load trail data: ${error.message}`);
    } finally {
        loadButton.disabled = false;
        loadButton.textContent = 'Reload Trail Data';
    }
}

// Add markers to the map
function addMarkersToMap(trailData) {
    trailData.forEach((trail, index) => {
        const marker = new google.maps.Marker({
            position: { lat: trail.latitude, lng: trail.longitude },
            map: map,
            title: trail.name,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
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
        { key: 'length', label: 'Length' },
        { key: 'type', label: 'Trail Type' },
        { key: 'rating', label: 'Rating' },
        { key: 'features', label: 'Features' }
    ];
    
    fields.forEach(field => {
        if (trail[field.key] && trail[field.key].trim()) {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${field.label}:</strong> ${trail[field.key]}`;
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
