
// JavaScript for Rendering Modern Weekly Mess Menu (Glass Theme)

document.addEventListener('DOMContentLoaded', () => {
    // Only run if the container exists
    if (document.getElementById('weekly-menu-container') || document.getElementById('daily-menu-container')) {
        renderWeeklyMenu();
    }
});

// Reuse global data or define local fallback
const MenuData = window.WeeklyMenu_Static || {
    "Sunday": {
        Breakfast: ["Idli", "Sambar", "Tea"],
        Lunch: ["Rice", "Dal", "Veg Curry", "Curd"],
        Snacks: ["Samosa", "Coffee"],
        Dinner: ["Chapati", "Paneer Curry", "Rice"]
    },
    "Monday": {
        Breakfast: ["Poha", "Banana", "Milk"],
        Lunch: ["Rice", "Sambar", "Beetroot Curry"],
        Snacks: ["Biscuits", "Tea"],
        Dinner: ["Chapati", "Dal Fry", "Veg Kurma"]
    },
    // ... (other days)
    "Tuesday": { Breakfast: ["Upma", "Chutney"], Lunch: ["Lemon Rice", "Curd"], Snacks: ["Bajji"], Dinner: ["Roti", "Veg Curry"] },
    "Wednesday": { Breakfast: ["Dosa", "Sambar"], Lunch: ["Veg Biryani"], Snacks: ["Sandwich"], Dinner: ["Chapati", "Kofta"] },
    "Thursday": { Breakfast: ["Pongal", "Vada"], Lunch: ["Rice", "Rasam"], Snacks: ["Cake"], Dinner: ["Phulka", "Aloo Gobi"] },
    "Friday": { Breakfast: ["Vada Pav"], Lunch: ["Fried Rice"], Snacks: ["Cutlet"], Dinner: ["Roti", "Palak Paneer"] },
    "Saturday": { Breakfast: ["Puri", "Bhaji"], Lunch: ["Khichdi", "Kadhi"], Snacks: ["Puff"], Dinner: ["Pasta", "Soup"] }
};

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = daysOfWeek[new Date().getDay()];

function renderWeeklyMenu() {
    let container = document.getElementById('weekly-menu-container');
    if (!container) return;

    // Header HTML with Next Meal Badge
    const headerHtml = `
        <div class="menu-header-area animate-fade-in">
            <h2 style="font-size: 1.8rem; background: linear-gradient(to right, var(--text-main), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Weekly Mess Menu 🍛
            </h2>
            <div id="next-meal-badge-container"></div>
        </div>
    `;

    // Clear existing content and set layout
    container.innerHTML = `
        ${headerHtml}
        <div id="day-selector" class="day-selector-wrapper animate-slide-up"></div>
        <div id="menu-timeline" class="timeline-container animate-slide-up delay-100"></div>
    `;

    renderDayTabs();
    renderDailyMenu(currentDay);
    updateNextMealBadge();
}

function renderDayTabs() {
    const container = document.getElementById('day-selector');
    if (!container) return;

    container.innerHTML = daysOfWeek.map(day => `
        <button onclick="renderDailyMenu('${day}')" 
             class="day-tab-modern ${day === currentDay ? 'active' : ''}" 
             id="tab-${day}">
             ${day.substring(0, 3)}
        </button>
    `).join('');
}

window.renderDailyMenu = function (day) {
    // Update active tab state
    document.querySelectorAll('.day-tab-modern').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${day}`);
    if (activeTab) activeTab.classList.add('active');

    const timelineContainer = document.getElementById('menu-timeline');
    if (!timelineContainer) return;

    // Get Data
    const liveMenu = (window.getData && window.getData.Menu && window.getData.Menu()) ? window.getData.Menu() : MenuData;
    const dailyMenu = liveMenu[day] || MenuData['Sunday']; // Fallback

    const meals = [
        { key: 'Breakfast', icon: 'fa-bread-slice', time: '7:30 AM - 9:30 AM', start: 7.5, end: 9.5 },
        { key: 'Lunch', icon: 'fa-bowl-rice', time: '1:00 PM - 2:30 PM', start: 13, end: 14.5 },
        { key: 'Snacks', icon: 'fa-mug-hot', time: '5:00 PM - 6:00 PM', start: 17, end: 18 },
        { key: 'Dinner', icon: 'fa-utensils', time: '7:30 PM - 9:30 PM', start: 19.5, end: 21.5 }
    ];

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const isToday = day === currentDay;

    let html = '';
    meals.forEach((meal, index) => {
        let status = 'Later';
        let statusClass = 'status-later';
        let statusIcon = '';
        let isExpanded = false;
        let countdown = '';

        if (isToday) {
            if (currentHour > meal.end) {
                status = 'Completed';
                statusClass = 'status-completed';
                statusIcon = '<i class="fa-solid fa-check"></i>';
            } else if (currentHour >= meal.start && currentHour <= meal.end) {
                status = 'Serving Now';
                statusClass = 'status-serving';
                isExpanded = true;
            } else if (currentHour < meal.start) {
                status = 'Upcoming';
                statusClass = 'status-upcoming';
                // Calculate mins until start
                const minsUntil = Math.floor((meal.start - currentHour) * 60);
                if (minsUntil < 60) {
                    countdown = `<div class="countdown-text"><i class="fa-regular fa-clock"></i> Starts in ${minsUntil} mins</div>`;
                }
            }
        }

        const items = getItems(dailyMenu[meal.key]);
        const delay = index * 0.1;

        // Inline items preview (first 3 items)
        const previewItems = items.slice(0, 3).map(i =>
            `<span class="food-preview-item"><i class="fa-solid fa-check"></i> ${i}</span>`
        ).join('');

        html += `
            <div class="timeline-item ${status === 'Serving Now' ? 'active' : ''} ${status === 'Completed' ? 'completed' : ''} animate-slide-up" style="animation-delay: ${delay}s;">
                <div class="timeline-icon">
                    <i class="fa-solid ${meal.icon}"></i>
                </div>
                
                <div class="meal-card-modern" onclick="toggleAccordion(this)">
                    <div class="meal-card-header">
                        <div class="meal-info">
                            <div class="meal-title-row">
                                <h3>${meal.key}</h3>
                                <span class="meal-time-pill">${meal.time}</span>
                            </div>
                            <div class="food-preview">
                                ${previewItems}
                                ${items.length > 3 ? `<span>+${items.length - 3} more</span>` : ''}
                            </div>
                        </div>
                        <div class="meal-status-container">
                            <span class="meal-status-pill ${statusClass}">
                                ${statusIcon} ${status}
                            </span>
                            ${countdown}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    timelineContainer.innerHTML = html;
};

function updateNextMealBadge() {
    const container = document.getElementById('next-meal-badge-container');
    if (!container) return;

    const meals = [
        { key: 'Breakfast', start: 7.5 },
        { key: 'Lunch', start: 13 },
        { key: 'Snacks', start: 17 },
        { key: 'Dinner', start: 19.5 }
    ];

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    // Find next meal
    let nextMeal = meals.find(m => m.start > currentHour);

    if (nextMeal) {
        const minsUntil = Math.floor((nextMeal.start - currentHour) * 60);
        let timeText = `in ${minsUntil} mins`;
        if (minsUntil > 60) {
            const h = Math.floor(minsUntil / 60);
            const m = minsUntil % 60;
            timeText = `in ${h}h ${m}m`;
        }

        container.innerHTML = `
            <div class="next-meal-badge animate-pop-in">
                Next: <span class="next-meal-highlight">${nextMeal.key}</span> ${timeText} 🍛
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="next-meal-badge animate-pop-in">
                See you tomorrow! 🌙
            </div>
        `;
    }
}

// Helper functions (same as before)
window.toggleAccordion = function (card) {
    // For this design, we might not strictly need accordion expansion if items are inline
    // But keeping it for future extensibility or details
};

function getItems(items) {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') return items.split(',').map(i => i.trim());
    return [];
}
