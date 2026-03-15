document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});

// Mock Authentication Helper (Legacy - use AuthService for new features)
const Auth = {
    login: async (role, username, password) => {
        // Use AuthService if available
        if (window.AuthService) {
            try {
                const email = username.includes('@') ? username : username + '@happylivingpg.com';
                const result = await AuthService.login(email, password, role);
                return true;
            } catch (error) {
                return false;
            }
        }

        // Fallback to simple validation
        if (role === 'admin' && username === 'admin' && password === 'admin123') {
            localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin User' }));
            return true;
        }
        if (role === 'student' && username === 'student' && password === 'student123') {
            localStorage.setItem('user', JSON.stringify({ role: 'student', name: 'John Doe', room: '101' }));
            return true;
        }
        return false;
    },

    logout: () => {
        if (window.AuthService) {
            AuthService.logout();
        } else {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        }
    },

    checkAuth: (requiredRole) => {
        if (window.AuthService) {
            const payload = AuthService.checkAuth(requiredRole);
            if (!payload) {
                window.location.href = '../index.html';
                return null;
            }
            return payload;
        }

        // Fallback
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || user.role !== requiredRole) {
            window.location.href = '../index.html';
        }
        return user;
    },

    updateUserName: () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            // Update admin dashboard header
            const adminHeading = document.querySelector('#dashboard-section h2');
            if (adminHeading && user.role === 'admin') {
                adminHeading.innerHTML = `Hello, ${user.name || 'Admin'}! 👋`;
            }

            // Update student dashboard header
            const studentHeaderName = document.querySelector('.header div strong');
            if (studentHeaderName && user.role === 'student') {
                studentHeaderName.innerHTML = `Hi, ${user.name || 'Student'}`;
            }

            // Update profile section
            const profileDisplay = document.getElementById('profile-name-display');
            if (profileDisplay) {
                profileDisplay.textContent = user.name || (user.role === 'admin' ? 'Admin' : 'Student');
            }
        }
    }
};

// Auto update user name on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateUserName();
});

function toggleMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        mobileNav.classList.toggle('show');
    }
}

// Global Toast System
window.showToast = function (title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: grid; gap: 10px; pointer-events: none;';
        document.body.appendChild(div);
    }

    const toast = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    toast.style.cssText = `
        background: white; 
        padding: 1rem 1.5rem; 
        border-radius: 8px; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
        border-left: 5px solid ${colors[type]}; 
        min-width: 250px; 
        max-width: 400px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 4.7s forwards;
    `;

    toast.innerHTML = `
        <div style="font-weight: bold; font-size: 0.9rem; margin-bottom: 0.2rem; color: ${colors[type]}">${title}</div>
        <div style="font-size: 0.85rem; color: #4b5563">${message}</div>
    `;

    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);
