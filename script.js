// Kirra's Nail Studio - Simplified Website JavaScript
// Appointment scheduling and interactive features

// Service data with pricing and duration (from original API)
const services = {
    'manicure': { name: 'Classic Manicure', duration: 30, price: 25, description: 'Professional nail care with cuticle work and polish application' },
    'pedicure': { name: 'Pedicure', duration: 45, price: 35, description: 'Relaxing foot spa treatment with nail care and polish' },
    'gel': { name: 'Gel Nails', duration: 60, price: 45, description: 'Long-lasting gel polish application for durability and shine' },
    'acrylic': { name: 'Acrylic Set', duration: 75, price: 55, description: 'Beautiful acrylic nail extensions with shape and design options' },
    'nail-art': { name: 'Custom Nail Art', duration: 90, price: 65, description: 'Unique artistic designs tailored to your personal style' },
    'mushroom-design': { name: 'Mushroom Special', duration: 90, price: 70, description: 'Our signature mushroom-themed nail art collection - exclusive design' }
};

// Working hours configuration
const workingHours = {
    monday: { start: '09:00', end: '18:00', closed: false },
    tuesday: { start: '09:00', end: '18:00', closed: false },
    wednesday: { start: '09:00', end: '18:00', closed: false },
    thursday: { start: '09:00', end: '18:00', closed: false },
    friday: { start: '09:00', end: '19:00', closed: false },
    saturday: { start: '10:00', end: '17:00', closed: false },
    sunday: { start: '12:00', end: '16:00', closed: true }
};

// Lunch break
const LUNCH_BREAK = { start: '12:30', end: '13:30' };

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAppointmentForm();
    initializeGallery();
    setMinDate();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.main-header').offsetHeight;
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Appointment form functionality
function initializeAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    const dateInput = document.getElementById('requestDate');
    const timeSelect = document.getElementById('requestTime');
    const serviceSelect = document.getElementById('serviceType');
    
    // Handle date change to update available times
    dateInput.addEventListener('change', function() {
        updateAvailableTimes();
    });
    
    // Handle service selection
    serviceSelect.addEventListener('change', function() {
        updateAvailableTimes();
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAppointmentRequest(e);
    });
}

// Set minimum date to today
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateStr = tomorrow.toISOString().split('T')[0];
    document.getElementById('requestDate').min = dateStr;
}

// Update available times based on selected date and service
function updateAvailableTimes() {
    const dateInput = document.getElementById('requestDate');
    const timeSelect = document.getElementById('requestTime');
    const serviceSelect = document.getElementById('serviceType');
    
    if (!dateInput.value || !serviceSelect.value) {
        timeSelect.innerHTML = '<option value="">Select time...</option>';
        return;
    }
    
    const selectedDate = new Date(dateInput.value);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const serviceType = serviceSelect.value;
    const serviceDuration = services[serviceType].duration;
    
    // Check if the day is closed
    if (workingHours[dayName].closed) {
        timeSelect.innerHTML = '<option value="">Closed on this day</option>';
        return;
    }
    
    const availableTimes = generateTimeSlots(dayName, serviceDuration);
    
    timeSelect.innerHTML = '<option value="">Select time...</option>';
    
    availableTimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = formatTime(time);
        timeSelect.appendChild(option);
    });
    
    if (availableTimes.length === 0) {
        timeSelect.innerHTML = '<option value="">No available times</option>';
    }
}

// Generate available time slots
function generateTimeSlots(dayName, serviceDuration) {
    const slots = [];
    const hours = workingHours[dayName];
    
    if (hours.closed) return slots;
    
    const startTime = timeToMinutes(hours.start);
    const endTime = timeToMinutes(hours.end);
    const lunchStart = timeToMinutes(LUNCH_BREAK.start);
    const lunchEnd = timeToMinutes(LUNCH_BREAK.end);
    
    let currentTime = startTime;
    
    while (currentTime + serviceDuration <= endTime) {
        // Skip lunch break
        if (!(currentTime < lunchEnd && currentTime + serviceDuration > lunchStart)) {
            slots.push(minutesToTime(currentTime));
        }
        currentTime += 30; // 30-minute intervals
    }
    
    return slots;
}

// Helper functions for time conversion
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Handle appointment request submission
function handleAppointmentRequest(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId(),
        clientName: document.getElementById('clientName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        serviceType: document.getElementById('serviceType').value,
        appointmentDate: document.getElementById('requestDate').value,
        appointmentTime: document.getElementById('requestTime').value,
        specialRequests: document.getElementById('specialRequests').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.clientName || !formData.phoneNumber || !formData.serviceType || 
        !formData.appointmentDate || !formData.appointmentTime) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Save appointment request
    saveAppointmentRequest(formData);
    
    // Show success message
    const serviceName = services[formData.serviceType].name;
    const formattedDate = new Date(formData.appointmentDate).toLocaleDateString();
    const formattedTime = formatTime(formData.appointmentTime);
    
    showNotification(
        `Thank you ${formData.clientName}! Your appointment request for ${serviceName} on ${formattedDate} at ${formattedTime} has been submitted. We'll confirm within 24 hours!`, 
        'success'
    );
    
    // Reset form
    document.getElementById('appointmentForm').reset();
    updateAvailableTimes();
}

// Save appointment request to localStorage
function saveAppointmentRequest(request) {
    let requests = JSON.parse(localStorage.getItem('appointmentRequests') || '[]');
    requests.push(request);
    localStorage.setItem('appointmentRequests', JSON.stringify(requests));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize gallery with service-related content
function initializeGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    // Gallery items that reflect the actual services offered
    const galleryItems = [
        { emoji: '💅', text: 'Classic Manicures', service: 'manicure' },
        { emoji: '🦶', text: 'Pedicures & Foot Care', service: 'pedicure' },
        { emoji: '✨', text: 'Gel Polish Perfection', service: 'gel' },
        { emoji: '🌸', text: 'Acrylic Extensions', service: 'acrylic' },
        { emoji: '�', text: 'Custom Nail Art', service: 'nail-art' },
        { emoji: '🍄', text: 'Signature Mushroom Designs', service: 'mushroom-design' },
        { emoji: '🌙', text: 'Night Sky Themes', service: 'nail-art' },
        { emoji: '🦋', text: 'Butterfly Patterns', service: 'nail-art' },
        { emoji: '🌺', text: 'Floral Designs', service: 'nail-art' },
        { emoji: '💎', text: 'Crystal & Gems', service: 'nail-art' },
        { emoji: '🌈', text: 'Rainbow Effects', service: 'gel' },
        { emoji: '🎵', text: 'Music-Inspired Art', service: 'nail-art' }
    ];
    
    galleryItems.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <div class="gallery-content">
                <span class="gallery-emoji">${item.emoji}</span>
                <span class="gallery-text">${item.text}</span>
            </div>
        `;
        galleryItem.dataset.service = item.service;
        
        // Add click functionality to scroll to booking with pre-selected service
        galleryItem.addEventListener('click', function() {
            const serviceType = this.dataset.service;
            scrollToBooking(serviceType);
        });
        
        galleryGrid.appendChild(galleryItem);
    });
}

// Service card interactions
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const serviceType = this.dataset.service;
            scrollToBooking(serviceType);
        });
    });
});

// Helper function to scroll to booking section with pre-selected service
function scrollToBooking(serviceType) {
    // Scroll to booking section
    const bookingSection = document.getElementById('booking');
    const headerHeight = document.querySelector('.main-header').offsetHeight;
    
    window.scrollTo({
        top: bookingSection.offsetTop - headerHeight - 20,
        behavior: 'smooth'
    });
    
    // Pre-select the service
    setTimeout(() => {
        if (serviceType) {
            document.getElementById('serviceType').value = serviceType;
            updateAvailableTimes();
        }
    }, 500);
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Smooth scrolling for all anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip navigation links (already handled)
            if (this.classList.contains('nav-link')) return;
            
            e.preventDefault();
            
            const targetSection = document.querySelector(href);
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Load and display saved appointment requests (for testing)
function loadAppointmentRequests() {
    const requests = JSON.parse(localStorage.getItem('appointmentRequests') || '[]');
    console.log('Saved appointment requests:', requests);
    return requests;
}

// Add some visual feedback for form interactions
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

// Vertical Sliding Gallery Implementation
function initializeVerticalSliders() {
    // Use gallery images for vertical sliders
    const IMAGE_FILENAMES = [
        'IMG_9914.PNG', 'IMG_9917.PNG', 'IMG_9920.PNG', 'IMG_9922.PNG', 'IMG_9923.PNG',
        'IMG_9924.PNG', 'IMG_9925.PNG', 'IMG_9927.PNG', 'IMG_9929.PNG', 'IMG_9932.PNG',
        'IMG_9933.PNG', 'IMG_9934.PNG', 'IMG_9936.PNG', 'IMG_9939.PNG', 'IMG_9940.PNG', 'IMG_9941.PNG'
    ];

    // Shuffle an array
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Create image slider item
    const createImageItem = (filename, index) => {
        const item = document.createElement('div');
        item.className = 'vertical-slider-item';
        const img = document.createElement('img');
        img.className = 'vertical-slider-image';
        img.src = `images/${filename}`;
        img.alt = `Nail Art ${index + 1}`;
        img.title = `Nail Art ${index + 1}`;
        item.appendChild(img);
        return item;
    };

    // Populate a slider with images
    const populateSlider = (containerId, items) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        container.innerHTML = '';
        items.forEach((filename, index) => {
            const imageItem = createImageItem(filename, index);
            container.appendChild(imageItem);
        });
        // Set animation direction based on slider (use correct keyframes)
        const isLeftSlider = container.parentElement.classList.contains('left-slider');
        container.style.animation = isLeftSlider ? 
            'scrollDownContinuous 36.85s linear infinite' :
            'scrollUpContinuous 36.85s linear infinite';
    };

    // Initialize sliders
    const initSliders = () => {
        try {
            // Shuffle and duplicate images for continuous scrolling
            const leftImages = shuffleArray(IMAGE_FILENAMES);
            const rightImages = shuffleArray(IMAGE_FILENAMES);
            const leftImageSet = [...leftImages, ...leftImages, ...leftImages.slice(0, 6)];
            const rightImageSet = [...rightImages, ...rightImages, ...rightImages.slice(0, 6)];
            // Populate sliders
            populateSlider('leftSliderContainer', leftImageSet);
            populateSlider('rightSliderContainer', rightImageSet);
            // Add hover pause effect
            document.querySelectorAll('.vertical-slider-container').forEach(container => {
                container.addEventListener('mouseenter', () => {
                    container.style.animationPlayState = 'paused';
                });
                container.addEventListener('mouseleave', () => {
                    container.style.animationPlayState = 'running';
                });
            });
            console.log('Vertical sliders initialized with gallery images');
        } catch (error) {
            console.error('Error initializing sliders:', error);
        }
    };

    // Initialize immediately
    initSliders();
}

// Initialize vertical sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeVerticalSliders();
});
