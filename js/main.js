document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Logic
    let cursor = document.getElementById('custom-cursor');
    let follower = document.getElementById('custom-cursor-follower');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);
    }
    if (!follower) {
        follower = document.createElement('div');
        follower.id = 'custom-cursor-follower';
        document.body.appendChild(follower);
    }

    // Disable custom cursor on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    if (cursor && follower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 50);
        });

        // Use event delegation for hover effects to handle dynamically added elements
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, button, .role-card, .nav-link, .pg-req-btn, .action-card, .btn');
            if (target) {
                cursor.style.transform = 'scale(2)';
                follower.style.transform = 'scale(1.5)';
                follower.style.borderColor = 'var(--cyber-cyan)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a, button, .role-card, .nav-link, .pg-req-btn, .action-card, .btn');
            if (target) {
                cursor.style.transform = 'scale(1)';
                follower.style.transform = 'scale(1)';
                follower.style.borderColor = 'var(--cyber-cyan)'; // Keep cyan for consistency
            }
        });
    }

    // Scroll Animation Observer (Enhanced)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
                if (entry.target.classList.contains('glass-card')) {
                    entry.target.classList.add('animate-pop-in');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, .glass-card, .feature-card').forEach(el => {
        observer.observe(el);
    });

    // Parallax Hero & Background Shapes
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroText = document.querySelector('.hero-text');
        if (heroText) {
            heroText.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroText.style.opacity = 1 - (scrolled / 500);
        }
    });

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const factor = (index + 1) * 20;
            shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
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
            const prefix = window.location.pathname.includes('/student/') || window.location.pathname.includes('/admin/') ? '../' : '';
            window.location.href = prefix + 'index.html';
        }
    },

    checkAuth: (requiredRole) => {
        if (window.AuthService) {
            const payload = AuthService.checkAuth(requiredRole);
            if (!payload) {
                const prefix = window.location.pathname.includes('/student/') || window.location.pathname.includes('/admin/') ? '../' : '';
                window.location.href = prefix + 'index.html';
                return null;
            }
            return payload;
        }

        // Fallback
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || user.role !== requiredRole) {
            const prefix = window.location.pathname.includes('/student/') || window.location.pathname.includes('/admin/') ? '../' : '';
            window.location.href = prefix + 'index.html';
        }
        return user;
    },

    getUser: () => {
        if (window.AuthService) {
            // AuthService saves user to localStorage as 'user'
            return JSON.parse(localStorage.getItem('user') || 'null');
        }
        return JSON.parse(localStorage.getItem('user') || 'null');
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
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'luminous-toast';

    // Custom colors based on type
    const accentColors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#00f2fe',
        warning: '#f59e0b'
    };

    toast.style.borderLeftColor = accentColors[type];

    toast.innerHTML = `
        <div style="font-weight: 800; font-size: 1rem; color: ${accentColors[type]}">${title}</div>
        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9)">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);
