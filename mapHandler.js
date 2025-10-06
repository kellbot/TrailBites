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
        mapTypeId: 'roadmap',
        mapId: 'DEMO_MAP_ID', // Required for Advanced Markers
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    const bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

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
        
        // Populate trails table
        populateTrailsTable(trailData);
        
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
        case 1: return '#86acffff';     // Easy - Blue
        case 2: return '#92d841ff';     // Easy-Medium - Green
        case 3: return '#ff8c00';     // Medium - Dark Orange
        case 4: return '#ff4500';     // Medium-Hard - Orange Red
        case 5: return '#dc143c';     // Hard - Crimson
        default: return '#2e7d2e';    // Default to green
    }
}

// Get marker icon URL based on difficulty
function getMarkerIcon(difficulty) {
    const color = getMarkerColor(difficulty);
    return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
}


function createTrailPin(trail) {
    const pin = new google.maps.marker.PinElement({
        scale: 1,
        background: getMarkerColor(trail.difficulty),
        borderColor: '#ffffff',
        glyphColor: '#ffffff'
    });
    return pin.element;
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

// Get display color for difficulty text (uses same colors as markers)
function getDifficultyDisplayColor(difficulty) {
    return getMarkerColor(difficulty);
}

// Add markers to the map
function addMarkersToMap(trailData) {
    trailData.forEach((trail, index) => {
        // Create custom marker content
        const markerContent = createTrailPin(trail);
        
        // Create Advanced Marker
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: trail.latitude, lng: trail.longitude },
            map: map,
            title: trail.name,
            content: markerContent
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
                const difficultyText = getDifficultyText(difficultyValue);
                const color = getDifficultyDisplayColor(difficultyValue);
                
                div.innerHTML = `<strong>${field.label}:</strong> <span style="color: ${color}; font-weight: bold;">${difficultyValue} - ${difficultyText}</span>`;
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
        marker.map = null; // Advanced Markers use map property instead of setMap()
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
        bounds.extend(marker.position); // Advanced Markers use position property
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

// Global variable to store trail data for table operations
let currentTrailData = [];

// Populate the trails table
function populateTrailsTable(trailData) {
    currentTrailData = trailData;
    const tableContainer = document.getElementById('trails-table-container');
    const tableBody = document.getElementById('trails-table-body');
    
    if (!tableContainer || !tableBody) return;
    
    // Show the table container
    tableContainer.style.display = 'block';
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Populate table rows
    trailData.forEach((trail, index) => {
        const row = createTrailTableRow(trail, index);
        tableBody.appendChild(row);
    });
    
    // Set up event listeners for filtering and searching
    setupTableControls();
}

// Create a table row for a trail
function createTrailTableRow(trail, index) {
    const row = document.createElement('tr');
    
    // Get difficulty info
    const difficultyValue = parseInt(trail.difficulty) || 1;
    const difficultyText = getDifficultyText(difficultyValue);
    const difficultyColor = getMarkerColor(difficultyValue);
    
    row.innerHTML = `
        <td><strong>${trail.name || 'Unknown'}</strong></td>
        <td>
            <span class="difficulty-badge" style="background-color: ${difficultyColor};">
                ${difficultyValue} - ${difficultyText}
            </span>
        </td>
        <td>${trail.trail || '-'}</td>
        <td class="trail-description" title="${trail.description || ''}">${trail.description || '-'}</td>
        <td class="trail-comments" title="${trail.comments || ''}">${trail.comments || '-'}</td>
        <td>
            <button class="trail-action-btn" onclick="focusOnTrail(${index})">
                View on Map
            </button>
        </td>
    `;
    
    return row;
}

// Focus on a specific trail on the map
function focusOnTrail(index) {
    const trail = currentTrailData[index];
    const marker = markers[index];
    
    if (trail && marker) {
        // Center map on the trail
        map.setCenter({ lat: trail.latitude, lng: trail.longitude });
        map.setZoom(15);
        
        // Open info window
        const infoContent = createInfoWindowContent(trail);
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
        
        // Scroll to top to show the map
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Set up table controls (search and filter)
function setupTableControls() {
    const searchInput = document.getElementById('search-input');
    const difficultyFilter = document.getElementById('difficulty-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterTable);
    }
}

// Filter table based on search and difficulty filter
function filterTable() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const difficultyFilter = document.getElementById('difficulty-filter')?.value || '';
    const tableBody = document.getElementById('trails-table-body');
    
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach((row, index) => {
        const trail = currentTrailData[index];
        if (!trail) return;
        
        // Check search term
        const matchesSearch = !searchTerm || 
            (trail.name && trail.name.toLowerCase().includes(searchTerm)) ||
            (trail.description && trail.description.toLowerCase().includes(searchTerm)) ||
            (trail.trail && trail.trail.toLowerCase().includes(searchTerm)) ||
            (trail.comments && trail.comments.toLowerCase().includes(searchTerm));
        
        // Check difficulty filter
        const matchesDifficulty = !difficultyFilter || 
            trail.difficulty === difficultyFilter;
        
        // Show/hide row
        if (matchesSearch && matchesDifficulty) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
