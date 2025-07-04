class HiringDashboard {
    constructor() {
        this.db = new HiringDatabase();
        this.currentData = [];
        this.initElements();
        this.bindEvents();
        this.loadHistoricalData();
        this.setDefaultDate();
    }

    initElements() {
        // Main input elements
        this.pasteDataTextarea = document.getElementById('paste-data');
        this.clearButton = document.getElementById('clear-data');
        this.saveButton = document.getElementById('save-data');
        
        // Summary elements
        this.weekStartDisplay = document.getElementById('week-start-display');
        this.slotsCount = document.getElementById('slots-count');
        this.totalTarget = document.getElementById('total-target');
        this.totalHired = document.getElementById('total-hired');
        this.totalRemaining = document.getElementById('total-remaining');
        this.referralStatusSpan = document.getElementById('referral-status');
        this.emergencyStatusSpan = document.getElementById('emergency-status');
        
        // Platform elements
        this.platformNameH3 = document.getElementById('platform-name');
        this.platformCostP = document.getElementById('platform-cost');
        this.platformDetails = document.getElementById('platform-details');
        
        // Date input element
        this.weekDateInput = document.getElementById('week-date');
        
        // Other elements
        this.statusDisplay = document.getElementById('status-display');
        this.statusBadge = document.getElementById('status-badge');
        this.statusIcon = document.getElementById('status-icon');
        this.statusText = document.getElementById('status-text');
        this.statusDetails = document.getElementById('status-details');
        this.urgencyDisplay = document.getElementById('urgency-display');
        this.urgencyText = document.getElementById('urgency-text');
        this.referralBadge = document.getElementById('referral-badge');
        this.emergencyChecklist = document.getElementById('emergency-checklist');
        this.operationalProtocol = document.getElementById('operational-protocol');
        this.protocolSteps = document.getElementById('protocol-steps');
        this.historyTbody = document.getElementById('history-tbody');
    }

    bindEvents() {
        // Real-time parsing as user types
        this.pasteDataTextarea.addEventListener('input', () => this.parseDataRealTime());
        this.pasteDataTextarea.addEventListener('paste', () => {
            setTimeout(() => this.parseDataRealTime(), 10);
        });
        
        this.clearButton.addEventListener('click', () => this.clearData());
        this.saveButton.addEventListener('click', () => this.saveData());
        
        // Listen for date changes
        this.weekDateInput.addEventListener('change', () => {
            if (this.calculatedHiring) {
                // Recalculate days until target when date changes
                this.calculatedHiring.days_until_target = this.getDaysUntilTargetWeek();
                this.updateDashboard();
            }
        });
        
        this.setDefaultDate();
        this.initializeDashboard();
    }

    initializeDashboard() {
        // Initialize urgency display with current date
        const daysUntil = this.getDaysUntilTargetWeek();
        this.updateUrgencyIndicator(daysUntil, 0);
    }

    setDefaultDate() {
        // Set default date to next Monday
        const nextMonday = this.getNextMonday();
        const dateString = nextMonday.toISOString().split('T')[0];
        this.weekDateInput.value = dateString;
        this.weekStartDisplay.textContent = nextMonday.toLocaleDateString();
    }

    parseDataRealTime() {
        const pastedData = this.pasteDataTextarea.value.trim();
        
        if (!pastedData) {
            this.clearDashboard();
            return;
        }

        try {
            const lines = pastedData.split('\n').filter(line => line.trim() !== '');
            
            // Skip header line if it exists
            const dataLines = lines.filter(line => !line.toLowerCase().includes('hiring need'));
            
            if (dataLines.length === 0) {
                this.clearDashboard();
                return;
            }

            // Parse each line for coverage requirements
            this.currentData = [];
            
            dataLines.forEach((line, index) => {
                // Extract time and coverage need
                const timeMatch = line.match(/(\d{1,2}:\d{2}:\d{2}\s+[AP]M)/);
                const numberMatch = line.match(/(-?\d+)$/);
                
                if (timeMatch && numberMatch) {
                    const time = timeMatch[1];
                    const coverageNeed = parseInt(numberMatch[1]);
                    
                    this.currentData.push({
                        time: time,
                        coverage_need: coverageNeed,
                        raw_value: coverageNeed
                    });
                }
            });

            this.calculateHiringRequirement();
            this.updateDashboard();
            
        } catch (error) {
            console.error('Parse error:', error);
            this.clearDashboard();
        }
    }

    calculateHiringRequirement() {
        if (this.currentData.length === 0) return;

        // Only consider positive values (negative means overstaffed, ignore them)
        const positiveSlots = this.currentData.filter(slot => slot.coverage_need > 0);
        
        if (positiveSlots.length === 0) {
            // All slots are overstaffed or zero, no hiring needed
            this.calculatedHiring = {
                target_hires: 0,
                currently_hired: 0,
                remaining: 0,
                coverage_slots: this.currentData.length,
                max_concurrent_coverage: 0,
                understaffed_slots: 0,
                days_until_target: this.getDaysUntilTargetWeek()
            };
            return;
        }

        // Find the maximum coverage requirement from positive slots only
        const maxCoverage = Math.max(...positiveSlots.map(slot => slot.coverage_need));
        
        // Store calculated values
        this.calculatedHiring = {
            target_hires: maxCoverage,
            currently_hired: 0, // We don't track hired count from time slots
            remaining: maxCoverage,
            coverage_slots: this.currentData.length,
            max_concurrent_coverage: maxCoverage,
            understaffed_slots: positiveSlots.length,
            days_until_target: this.getDaysUntilTargetWeek()
        };
    }

    getDaysUntilTargetWeek() {
        const today = new Date();
        const targetDate = this.weekDateInput.value;
        
        if (!targetDate) return 0;
        
        const target = new Date(targetDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }

    getTimeBasedPlatformRecommendation(hiresNeeded, daysUntil) {
        const platforms = [
            { platform: 'Facebook', cost: '₱500', minHires: 1, maxHires: 5 },
            { platform: 'Indeed', cost: '$4/day', minHires: 6, maxHires: 7 },
            { platform: 'LinkedIn', cost: '₱2,566.33 total', minHires: 8, maxHires: 9 },
            { platform: 'Jobstreet', cost: '₱5,000+', minHires: 10, maxHires: 999 }
        ];

        // Time-based protocol
        if (daysUntil >= 14) {
            // 14-21+ days: Use Facebook only
            return {
                ...platforms[0],
                reason: `${daysUntil} days until target week - Use Facebook for early planning`,
                urgency: 'low'
            };
        } else if (daysUntil >= 8) {
            // 8-13 days: Use Facebook + activate referral bonus
            return {
                ...platforms[0],
                reason: `${daysUntil} days until target week - Facebook + Referral Bonus activated`,
                urgency: 'medium'
            };
        } else {
            // 7 days or less: Platform based on hires needed
            let selectedPlatform;
            if (hiresNeeded <= 2) {
                selectedPlatform = platforms[0]; // Facebook
            } else if (hiresNeeded <= 8) {
                selectedPlatform = platforms[1]; // Indeed
            } else if (hiresNeeded <= 19) {
                selectedPlatform = platforms[2]; // LinkedIn
            } else {
                selectedPlatform = platforms[3]; // Jobstreet
            }
            
            return {
                ...selectedPlatform,
                reason: `URGENT: ${daysUntil} days left, ${hiresNeeded} hires needed`,
                urgency: 'high'
            };
        }
    }

    getTimeBasedReferralBonus(hiresNeeded, daysUntil) {
        // Original logic: 5+ hires always activates referral
        // Time-based logic: 8-13 days OR 5+ hires activates referral
        return hiresNeeded >= 5 || (daysUntil >= 8 && daysUntil <= 13);
    }

    updateDashboard() {
        if (this.currentData.length === 0 || !this.calculatedHiring) {
            this.clearDashboard();
            return;
        }

        const { target_hires, currently_hired, remaining, coverage_slots, max_concurrent_coverage, days_until_target } = this.calculatedHiring;
        
        // Update week display
        const selectedDate = this.weekDateInput.value;
        if (selectedDate) {
            this.weekStartDisplay.textContent = new Date(selectedDate).toLocaleDateString();
        } else {
            const nextMonday = this.getNextMonday();
            this.weekStartDisplay.textContent = nextMonday.toLocaleDateString();
        }
        this.slotsCount.textContent = `${coverage_slots} (${days_until_target} days left)`;
        
        // Update status and urgency indicators
        this.updateStatusIndicator(days_until_target, remaining, target_hires);
        this.updateUrgencyIndicator(days_until_target, remaining);
        
        // Update totals based on coverage calculation
        this.totalTarget.textContent = target_hires;
        this.totalHired.textContent = currently_hired;
        this.totalRemaining.textContent = remaining;
        
        // Update referral bonus status using time-based logic
        const referralActive = this.getTimeBasedReferralBonus(remaining, days_until_target);
        this.referralStatusSpan.textContent = referralActive ? '✅' : '❌';
        this.referralBadge.textContent = referralActive ? 'Referral Bonus: Active' : 'Referral Bonus: Inactive';
        this.referralBadge.className = referralActive ? 'badge active' : 'badge inactive';
        
        // Update emergency alert status (urgent when ≤7 days)
        const emergencyActive = days_until_target <= 7 && remaining > 0;
        this.emergencyStatusSpan.textContent = emergencyActive ? '🔴' : '❌';
        
        if (emergencyActive) {
            this.emergencyChecklist.classList.remove('hidden');
            this.operationalProtocol.classList.remove('hidden');
            this.updateOperationalProtocol(days_until_target, remaining);
        } else {
            this.emergencyChecklist.classList.add('hidden');
            this.operationalProtocol.classList.add('hidden');
        }
        
        // Update platform suggestion using time-based logic
        if (remaining > 0) {
            const recommendedPlatform = this.getTimeBasedPlatformRecommendation(remaining, days_until_target);
            this.platformNameH3.textContent = recommendedPlatform.platform;
            this.platformCostP.textContent = `Estimated Cost: ${recommendedPlatform.cost}`;
            
            let urgencyColor = '';
            if (recommendedPlatform.urgency === 'high') urgencyColor = 'style="color: #e53e3e; font-weight: bold;"';
            else if (recommendedPlatform.urgency === 'medium') urgencyColor = 'style="color: #f56500; font-weight: bold;"';
            else urgencyColor = 'style="color: #38a169; font-weight: bold;"';
            
            this.platformDetails.innerHTML = `
                <p ${urgencyColor}><strong>Timing:</strong> ${recommendedPlatform.reason}</p>
                <p><strong>Platform Logic:</strong> ${this.getTimeBasedDescription(days_until_target, remaining)}</p>
                <p><strong>Coverage Needed:</strong> ${max_concurrent_coverage} teachers max</p>
                <p><strong>Understaffed Slots:</strong> ${this.calculatedHiring.understaffed_slots || coverage_slots} time periods</p>
            `;
        } else {
            this.platformNameH3.textContent = 'No hiring needed';
            this.platformCostP.textContent = days_until_target > 0 ? `${days_until_target} days until target week` : 'Select target date';
            this.platformDetails.innerHTML = '';
        }
        
        // Add live update animation
        document.querySelectorAll('.stat-value').forEach(el => {
            el.classList.add('live-update');
            setTimeout(() => el.classList.remove('live-update'), 2000);
        });
    }

    clearDashboard() {
        this.currentData = [];
        this.calculatedHiring = null;
        
        // Reset displays to default
        const selectedDate = this.weekDateInput.value;
        if (selectedDate) {
            this.weekStartDisplay.textContent = new Date(selectedDate).toLocaleDateString();
        } else {
            this.weekStartDisplay.textContent = '-';
        }
        
        this.slotsCount.textContent = '0';
        this.totalTarget.textContent = '0';
        this.totalHired.textContent = '0';
        this.totalRemaining.textContent = '0';
        this.referralStatusSpan.textContent = '❌';
        this.emergencyStatusSpan.textContent = '❌';
        this.referralBadge.textContent = 'Referral: Inactive';
        this.referralBadge.className = 'badge inactive';
        this.emergencyChecklist.classList.add('hidden');
        this.operationalProtocol.classList.add('hidden');
        this.platformNameH3.textContent = 'No platform selected';
        this.platformCostP.textContent = 'Select date and paste hiring data';
        this.platformDetails.innerHTML = '';
        
        // Reset status to unknown
        this.updateStatusIndicator(0, 0, 0);
        
        // Reset urgency based on selected date
        if (selectedDate) {
            const daysUntil = this.getDaysUntilTargetWeek();
            this.updateUrgencyIndicator(daysUntil, 0);
        } else {
            this.urgencyDisplay.className = 'urgency-indicator';
            this.urgencyText.textContent = 'Select date to see urgency';
        }
    }

    getNextMonday() {
        const today = new Date();
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
        return nextMonday;
    }

    clearData() {
        this.pasteDataTextarea.value = '';
        this.setDefaultDate();
        this.clearDashboard();
    }

    updateStatusIndicator(daysUntil, remaining, totalNeeded) {
        this.statusBadge.className = 'status-badge-large';
        
        if (remaining === 0 && totalNeeded > 0) {
            // Secured - All positions filled
            this.statusBadge.classList.add('status-secured');
            this.statusIcon.textContent = '✅';
            this.statusText.textContent = 'SECURED';
            this.statusDetails.innerHTML = `<p>All ${totalNeeded} positions filled!</p>`;
        } else if (daysUntil <= 7 && remaining > 0) {
            // Emergency - 7 days or less with open positions
            this.statusBadge.classList.add('status-emergency');
            this.statusIcon.textContent = '🚨';
            this.statusText.textContent = 'EMERGENCY';
            this.statusDetails.innerHTML = `<p>Only ${daysUntil} days left!<br>Need ${remaining} teachers urgently</p>`;
        } else if (remaining > 0 && totalNeeded > 0) {
            // Planning - More than 7 days, positions open
            this.statusBadge.classList.add('status-planning');
            this.statusIcon.textContent = '📋';
            this.statusText.textContent = 'PLANNING';
            this.statusDetails.innerHTML = `<p>${daysUntil} days to hire ${remaining} teachers<br>On track for success</p>`;
        } else {
            // Unknown - No data
            this.statusBadge.classList.add('status-unknown');
            this.statusIcon.textContent = '❓';
            this.statusText.textContent = 'NO DATA';
            this.statusDetails.innerHTML = '<p>Enter hiring data to see status</p>';
        }
    }

    updateUrgencyIndicator(daysUntil, hiresNeeded) {
        this.urgencyDisplay.className = 'urgency-indicator';
        
        if (daysUntil >= 14) {
            this.urgencyDisplay.classList.add('urgency-low');
            this.urgencyText.textContent = `📅 EARLY: ${daysUntil} days - Facebook only`;
        } else if (daysUntil >= 8) {
            this.urgencyDisplay.classList.add('urgency-medium');
            this.urgencyText.textContent = `⚡ PRE-HIRE: ${daysUntil} days - Facebook + Referral`;
        } else if (daysUntil > 0) {
            this.urgencyDisplay.classList.add('urgency-high');
            this.urgencyText.textContent = `🚨 URGENT: ${daysUntil} days - Platform by volume`;
        } else {
            this.urgencyDisplay.classList.add('urgency-high');
            this.urgencyText.textContent = `🔥 OVERDUE: Target week arrived!`;
        }
    }

    updateOperationalProtocol(daysUntil, remaining) {
        const protocols = this.getOperationalProtocols(daysUntil, remaining);
        
        this.protocolSteps.innerHTML = '';
        
        protocols.forEach(protocol => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `protocol-step ${protocol.critical ? 'critical' : ''}`;
            
            stepDiv.innerHTML = `
                <div class="step-title">${protocol.title}</div>
                <div class="step-description">${protocol.description}</div>
            `;
            
            this.protocolSteps.appendChild(stepDiv);
        });
    }

    getOperationalProtocols(daysUntil, remaining) {
        const protocols = [];
        
        if (daysUntil <= 0) {
            // Day of target week - EXTREME measures
            protocols.push({
                title: "🚨 IMMEDIATE: Deploy Senior Staff",
                description: "Steven and Mr. Bruce step in to cover critical classes. All administrative duties redirected.",
                critical: true
            });
            protocols.push({
                title: "📞 Emergency Teacher Pool",
                description: "Contact all previous teachers, part-time staff, and retired teachers for immediate availability.",
                critical: true
            });
            protocols.push({
                title: "📚 Combine Classes",
                description: "Merge smaller groups, increase class sizes temporarily to reduce teacher requirements.",
                critical: false
            });
        } else if (daysUntil === 1) {
            // 1 day left - Last resort measures
            protocols.push({
                title: "🚨 CRITICAL: Senior Management Deployment",
                description: "Steven and Mr. Bruce prepare to teach tomorrow. Clear all administrative schedules.",
                critical: true
            });
            protocols.push({
                title: "📋 Front Desk Coverage",
                description: "Administrative staff on standby to cover classes. Prepare lesson plans for non-teaching staff.",
                critical: true
            });
            protocols.push({
                title: "🔄 Class Restructuring",
                description: "Finalize class combinations and schedule adjustments to minimize teacher requirements.",
                critical: false
            });
        } else if (daysUntil === 2) {
            // 2 days left - Deploy front desk
            protocols.push({
                title: "👥 Front Desk Teacher Activation",
                description: "Administrative staff with teaching credentials step in to cover classes. Prepare teaching materials.",
                critical: true
            });
            protocols.push({
                title: "📞 Final Hiring Push",
                description: "Personal outreach to all candidates. Offer immediate start bonuses and expedited processing.",
                critical: false
            });
            protocols.push({
                title: "📚 Emergency Lesson Prep",
                description: "Prepare simplified lesson plans that any staff member can execute effectively.",
                critical: false
            });
        } else if (daysUntil === 3) {
            // 3 days left - Increase group sizes
            protocols.push({
                title: "📈 Increase Group Numbers",
                description: "Consolidate smaller classes into larger groups. Adjust classroom capacity and seating arrangements.",
                critical: false
            });
            protocols.push({
                title: "🎯 Intensive Recruitment",
                description: "Daily candidate calls, same-day interviews, immediate decision making for qualified candidates.",
                critical: false
            });
            protocols.push({
                title: "📋 Staff Cross-Training",
                description: "Brief administrative staff on emergency teaching procedures and classroom management.",
                critical: false
            });
        } else if (daysUntil <= 7) {
            // 4-7 days left - General emergency measures
            protocols.push({
                title: "🚨 All-Platform Recruitment",
                description: "Post on ALL platforms simultaneously. Increase budget allocation for urgent hiring.",
                critical: false
            });
            protocols.push({
                title: "💰 Emergency Incentives",
                description: "Activate sign-on bonuses, referral rewards, and expedited start incentives.",
                critical: false
            });
            protocols.push({
                title: "📞 Network Activation",
                description: "Contact personal networks, partner schools, and freelance teacher databases.",
                critical: false
            });
        }
        
        return protocols;
    }

    getTimeBasedDescription(daysUntil, hiresNeeded) {
        if (daysUntil >= 14) {
            return `Early planning phase (${daysUntil} days) - Facebook only`;
        } else if (daysUntil >= 8) {
            return `Pre-hiring phase (${daysUntil} days) - Facebook + Referral activated`;
        } else {
            let reason = `URGENT HIRING (${daysUntil} days left) - Platform by need: `;
            if (hiresNeeded <= 2) reason += '1-2 needed → Facebook';
            else if (hiresNeeded <= 8) reason += '3-8 needed → Indeed';
            else if (hiresNeeded <= 19) reason += '9-19 needed → LinkedIn';
            else reason += '20+ needed → Jobstreet';
            return reason;
        }
    }

    getPlatformDescription(platform) {
        const descriptions = {
            'Facebook': 'Small-scale hiring with local targeting',
            'Indeed': 'Medium-scale hiring with professional reach',
            'LinkedIn': 'Professional networking and quality candidates',
            'Jobstreet': 'Large-scale hiring across multiple regions'
        };
        return descriptions[platform] || 'General hiring needs';
    }

    saveData() {
        if (this.currentData.length === 0 || !this.calculatedHiring) {
            alert('Please paste hiring data first before saving to history.');
            return;
        }
        
        const { target_hires, currently_hired, remaining, coverage_slots, max_concurrent_coverage, days_until_target } = this.calculatedHiring;
        const referralActive = this.getTimeBasedReferralBonus(remaining, days_until_target);
        const emergencyActive = days_until_target <= 7 && remaining > 0;
        const recommendedPlatform = this.getTimeBasedPlatformRecommendation(remaining, days_until_target);
        
        const selectedDate = this.weekDateInput.value || this.getNextMonday().toISOString().split('T')[0];
        
        const data = {
            week_start_date: selectedDate,
            target_hires: target_hires,
            hired: currently_hired,
            remaining: remaining,
            referral_bonus: referralActive,
            emergency_alert: emergencyActive,
            recommended_platform: recommendedPlatform.platform,
            platform_cost: recommendedPlatform.cost,
            time_slots: coverage_slots,
            max_coverage: max_concurrent_coverage,
            understaffed_slots: this.calculatedHiring.understaffed_slots || 0,
            slot_details: this.currentData.length > 0 ? this.currentData.map(item => `${item.time}: ${item.raw_value}`).join(', ') : 'Manual input',
            created_at: new Date().toISOString()
        };
        
        this.db.saveHiringData(data);
        this.loadHistoricalData();
        
        alert(`Coverage data saved! Need ${target_hires} teachers to cover ${coverage_slots} time slots (max ${max_concurrent_coverage} concurrent)`);
    }

    loadHistoricalData() {
        const historicalData = this.db.getHiringData();
        this.historyTbody.innerHTML = '';
        
        if (historicalData.length === 0) {
            this.historyTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #718096;">No historical data available</td></tr>';
            return;
        }
        
        // Sort by week start date (most recent first)
        historicalData.sort((a, b) => new Date(b.week_start_date) - new Date(a.week_start_date));
        
        historicalData.forEach(record => {
            const row = document.createElement('tr');
            
            const statusBadges = [];
            if (record.referral_bonus) statusBadges.push('<span class="status-badge status-referral">Referral</span>');
            if (record.emergency_alert) statusBadges.push('<span class="status-badge status-emergency">Emergency</span>');
            if (statusBadges.length === 0) statusBadges.push('<span class="status-badge status-normal">Normal</span>');
            
            row.innerHTML = `
                <td>${new Date(record.week_start_date).toLocaleDateString()}</td>
                <td>${record.target_hires}</td>
                <td>${record.hired}</td>
                <td>${record.remaining}</td>
                <td>${record.recommended_platform}</td>
                <td>${statusBadges.join(' ')}</td>
                <td><button class="delete-btn" onclick="window.dashboard.deleteRecord(${record.id})">Delete</button></td>
            `;
            
            this.historyTbody.appendChild(row);
        });
    }

    deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.db.deleteHiringRecord(id);
            this.loadHistoricalData();
            alert('Record deleted successfully!');
        }
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new HiringDashboard();
});

// Add database script to the page
const script = document.createElement('script');
script.src = 'database.js';
document.head.appendChild(script);