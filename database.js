class HiringDatabase {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        // Using localStorage for client-side storage
        if (!localStorage.getItem('hiringData')) {
            localStorage.setItem('hiringData', JSON.stringify([]));
        }
        if (!localStorage.getItem('platformData')) {
            const platforms = [
                { platform: 'Facebook', cost: '₱500', minHires: 1, maxHires: 5 },
                { platform: 'Indeed', cost: '$4/day', minHires: 6, maxHires: 7 },
                { platform: 'LinkedIn', cost: '₱2,566.33 total', minHires: 8, maxHires: 9 },
                { platform: 'Jobstreet', cost: '₱5,000+', minHires: 10, maxHires: 999 }
            ];
            localStorage.setItem('platformData', JSON.stringify(platforms));
        }
    }

    saveHiringData(data) {
        const existingData = JSON.parse(localStorage.getItem('hiringData'));
        
        // Check if data for this week already exists
        const existingIndex = existingData.findIndex(item => 
            item.week_start_date === data.week_start_date
        );

        if (existingIndex !== -1) {
            // Update existing record
            existingData[existingIndex] = {
                ...existingData[existingIndex],
                ...data,
                id: existingData[existingIndex].id
            };
        } else {
            // Add new record
            data.id = Date.now();
            existingData.push(data);
        }

        localStorage.setItem('hiringData', JSON.stringify(existingData));
        return data;
    }

    getHiringData() {
        return JSON.parse(localStorage.getItem('hiringData'));
    }

    getPlatformData() {
        return JSON.parse(localStorage.getItem('platformData'));
    }

    getRecommendedPlatform(targetHires) {
        const platforms = this.getPlatformData();
        
        for (const platform of platforms) {
            if (targetHires >= platform.minHires && targetHires <= platform.maxHires) {
                return platform;
            }
        }
        
        return platforms[platforms.length - 1]; // Return last platform (Jobstreet) for 10+
    }

    deleteHiringRecord(id) {
        const existingData = JSON.parse(localStorage.getItem('hiringData'));
        const filteredData = existingData.filter(item => item.id !== id);
        localStorage.setItem('hiringData', JSON.stringify(filteredData));
    }

    clearAllData() {
        localStorage.removeItem('hiringData');
        localStorage.removeItem('platformData');
        this.init();
    }
}