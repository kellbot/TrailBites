// CSV Parser utility functions
class CSVParser {
    static parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const row = {};
                
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index] ? values[index].trim() : '';
                });
                
                data.push(row);
            }
        }

        return data;
    }

    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    static validateLocationData(data) {
        const requiredFields = ['name', 'latitude', 'longitude'];
        const validData = [];

        data.forEach((row, index) => {
            const missingFields = requiredFields.filter(field => !row[field]);
            
            if (missingFields.length > 0) {
                console.warn(`Row ${index + 1} missing required fields: ${missingFields.join(', ')}`);
                return;
            }

            const lat = parseFloat(row.latitude);
            const lng = parseFloat(row.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                console.warn(`Row ${index + 1} has invalid coordinates: lat=${row.latitude}, lng=${row.longitude}`);
                return;
            }

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn(`Row ${index + 1} has out-of-range coordinates: lat=${lat}, lng=${lng}`);
                return;
            }

            validData.push({
                ...row,
                latitude: lat,
                longitude: lng
            });
        });

        return validData;
    }
}

// Function to load and parse CSV data
async function loadCSVData(csvFilePath) {
    try {
        const response = await fetch(csvFilePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const parsedData = CSVParser.parseCSV(csvText);
        const validatedData = CSVParser.validateLocationData(parsedData);
        
        console.log(`Loaded ${validatedData.length} valid locations from CSV`);
        return validatedData;
        
    } catch (error) {
        console.error('Error loading CSV data:', error);
        throw error;
    }
}
