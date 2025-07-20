// Kirra's Nail Studio - Optimized Website JavaScript
// Performance optimizations and mobile-first approach

// Performance optimization: Use requestAnimationFrame for smooth animations
let animationFrame;

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

// SMS Gateway configuration (owner's phone number and carrier)
const SMS_CONFIG = {
    // Replace with owner's actual phone number (10 digits, no formatting)
    phoneNumber: '4632457230', // Kirra's actual phone number
    
    // Replace with owner's carrier gateway
    // AT&T: txt.att.net, Verizon: vtext.com, T-Mobile: tmomail.net, Sprint: messaging.sprintpcs.com
    carrier: 'txt.att.net', // CHANGE THIS TO YOUR CARRIER

    // Get SMS email address
    getSMSEmail: function() {
        return `${this.phoneNumber}@${this.carrier}`;
    }
};

// Performance optimization: Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization: Throttle function for resize events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize the website with performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Use requestAnimationFrame for smooth initialization
    requestAnimationFrame(() => {
        initializeNavigation();
        initializeAppointmentForm();
        setMinDate();
        
        // Lazy load gallery and sliders to improve initial page load
        if ('IntersectionObserver' in window) {
            lazyLoadGallery();
            lazyLoadVerticalSliders();
        } else {
            // Fallback for older browsers
            initializeGallery();
            initializeVerticalSliders();
        }
    });
});

// Optimized navigation functionality with passive event listeners
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Performance: Use DocumentFragment to batch DOM updates
            const fragment = document.createDocumentFragment();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section with optimized scrolling
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                // Use smooth scrolling with requestAnimationFrame for better performance
                smoothScrollTo(targetPosition);
            }
        });
    });
    
    // Debounced scroll event for performance
    const debouncedScrollHandler = debounce(updateActiveNavLink, 10);
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
}

// Optimized smooth scrolling
function smoothScrollTo(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function for smooth animation
        const ease = easeInOutCubic(percentage);
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (progress < duration) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

// Easing function for smooth animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Optimized active nav link updating
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
    
    // Batch DOM updates for performance
    requestAnimationFrame(() => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Optimized appointment form initialization
function initializeAppointmentForm() {
    const form = document.getElementById('appointment-form') || document.getElementById('appointmentForm');
    const dateInput = document.getElementById('date') || document.getElementById('requestDate');
    const timeSelect = document.getElementById('time') || document.getElementById('requestTime');
    const serviceSelect = document.getElementById('service') || document.getElementById('serviceType');
    const serviceInfo = document.getElementById('service-info');
    
    if (!form) return;
    
    // Service selection handler with debouncing
    const debouncedServiceChange = debounce(() => {
        if (serviceInfo) updateServiceInfo();
        updateAvailableTimes();
    }, 300);
    
    if (serviceSelect) serviceSelect.addEventListener('change', debouncedServiceChange);
    if (dateInput) dateInput.addEventListener('change', updateAvailableTimes);
    
    // Form submission with SMS notification
    form.addEventListener('submit', handleFormSubmission);
    
    // Initialize service info
    if (serviceInfo) updateServiceInfo();
}

function updateServiceInfo() {
    const serviceSelect = document.getElementById('service') || document.getElementById('serviceType');
    const serviceInfo = document.getElementById('service-info');
    const selectedService = services[serviceSelect.value];
    
    if (selectedService && serviceInfo) {
        requestAnimationFrame(() => {
            serviceInfo.innerHTML = `
                <div class="service-details">
                    <h4>${selectedService.name}</h4>
                    <p class="service-description">${selectedService.description}</p>
                    <div class="service-meta">
                        <span class="duration">⏱️ ${selectedService.duration} minutes</span>
                        <span class="price">💰 $${selectedService.price}</span>
                    </div>
                </div>
            `;
            serviceInfo.style.display = 'block';
        });
    } else if (serviceInfo) {
        serviceInfo.style.display = 'none';
    }
}

// Optimized form submission handler
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Use either form ID that exists
    const form = document.getElementById('appointment-form') || document.getElementById('appointmentForm');
    const formData = new FormData(form);
    
    // Extract form data with fallback field names
    const appointmentData = {
        id: generateId(),
        clientName: formData.get('name') || formData.get('clientName'),
        phoneNumber: formData.get('phone') || formData.get('phoneNumber'),
        email: formData.get('email'),
        serviceType: formData.get('service') || formData.get('serviceType'),
        appointmentDate: formData.get('date') || formData.get('requestDate'),
        appointmentTime: formData.get('time') || formData.get('requestTime'),
        specialRequests: formData.get('message') || formData.get('specialRequests') || '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Validate required fields
    if (!appointmentData.clientName || !appointmentData.phoneNumber || !appointmentData.serviceType || 
        !appointmentData.appointmentDate || !appointmentData.appointmentTime) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Save appointment request
    saveAppointmentRequest(appointmentData);
    
    // Send notifications
    sendAppointmentNotifications(appointmentData);
    
    // Show success message
    const serviceName = services[appointmentData.serviceType].name;
    const formattedDate = new Date(appointmentData.appointmentDate).toLocaleDateString();
    const formattedTime = formatTime(appointmentData.appointmentTime);
    
    showNotification(
        `Thank you ${appointmentData.clientName}! Your appointment request for ${serviceName} on ${formattedDate} at ${formattedTime} has been submitted. We'll confirm within 24 hours!`, 
        'success'
    );
    
    // Reset form
    form.reset();
    updateAvailableTimes();
}

// Performance optimized notification system
function showNotification(message, type = 'success') {
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
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
    
    // Send email and SMS notifications
    sendAppointmentNotifications(formData);
    
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

// Send appointment notifications via email and SMS
function sendAppointmentNotifications(formData) {
    const serviceName = services[formData.serviceType].name;
    const servicePrice = services[formData.serviceType].price;
    const formattedDate = new Date(formData.appointmentDate).toLocaleDateString();
    const formattedTime = formatTime(formData.appointmentTime);
    
    // Create message content
    const message = `NEW APPOINTMENT REQUEST
    
Client: ${formData.clientName}
Phone: ${formData.phoneNumber}
Email: ${formData.email || 'Not provided'}
Service: ${serviceName} ($${servicePrice})
Date: ${formattedDate}
Time: ${formattedTime}
Special Requests: ${formData.specialRequests || 'None'}

Please confirm within 24 hours.`;

    // Send email notification to owner
    sendEmailNotification(formData, message);
    
    // Send SMS notification to owner
    sendSMSNotification(formData, message);
}

// Send email notification using FormSubmit
function sendEmailNotification(formData, message) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/hello@kirrasnailstudio.com'; // Replace with your email
    form.style.display = 'none';
    
    // Add form fields
    const fields = {
        '_subject': 'New Appointment Request - Kirra\'s Nail Studio',
        '_captcha': 'false',
        '_template': 'table',
        '_next': window.location.href, // Redirect back to the same page
        'message': message,
        'client_name': formData.clientName,
        'client_phone': formData.phoneNumber,
        'client_email': formData.email,
        'service': services[formData.serviceType].name,
        'appointment_date': formData.appointmentDate,
        'appointment_time': formData.appointmentTime,
        'studio_phone': '(463) 245-7230'
    };
    
    Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit(); // Actually submit the email form
    document.body.removeChild(form);
}

// Send SMS notification using email-to-SMS gateway
function sendSMSNotification(formData, message) {
    // Create a shorter message for SMS (160 character limit)
    const smsMessage = `NEW BOOKING: ${formData.clientName}, ${formData.phoneNumber}, ${services[formData.serviceType].name}, ${new Date(formData.appointmentDate).toLocaleDateString()}, ${formatTime(formData.appointmentTime)}`;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/' + SMS_CONFIG.getSMSEmail();
    form.style.display = 'none';
    form.target = '_blank'; // Open in new tab to avoid redirect
    
    // Add form fields for SMS
    const smsFields = {
        '_subject': 'Kirra\'s Nail Studio', // Short subject for SMS
        '_captcha': 'false',
        '_template': 'box', // Minimal template
        '_next': 'https://kirrasnailstudio.com', // Redirect URL
        'message': smsMessage
    };
    
    Object.keys(smsFields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = smsFields[key];
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    
    // Submit the SMS form with a slight delay to avoid conflicts
    setTimeout(() => {
        form.submit();
        document.body.removeChild(form);
    }, 1000);
    
    console.log('SMS sent to:', SMS_CONFIG.getSMSEmail());
    console.log('SMS message:', smsMessage);
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

// Lazy loading for gallery images with Intersection Observer
function lazyLoadGallery() {
    const galleryImages = document.querySelectorAll('.gallery-image, .vertical-slider-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src || img.src;
                    
                    if (img.dataset.src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        galleryImages.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
}

// Optimized image modal functionality with better performance
function showImageModal(imageSrc, imageAlt) {
    let modal = document.getElementById('imageModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modalCaption');
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="image-modal-close" aria-label="Close image modal">&times;</button>
                <img class="image-modal-img" id="modalImage" alt="">
                <div class="image-modal-caption" id="modalCaption"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Optimized event listeners
        const closeBtn = modal.querySelector('.image-modal-close');
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
    
    // Show the modal with smooth animation
    const modalImg = modal.querySelector('#modalImage');
    const modalCaption = modal.querySelector('#modalCaption');
    
    modalImg.src = imageSrc;
    modalImg.alt = imageAlt;
    modalCaption.textContent = imageAlt;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
}

// Optimized gallery initialization with real images
function initializeGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    // Real nail art images with service associations
    const galleryImages = [
        { src: 'images/IMG_9914.PNG', alt: 'Classic Manicure Design', service: 'manicure' },
        { src: 'images/IMG_9917.PNG', alt: 'Gel Polish Perfection', service: 'gel' },
        { src: 'images/IMG_9920.PNG', alt: 'Custom Nail Art', service: 'nail-art' },
        { src: 'images/IMG_9922.PNG', alt: 'Acrylic Extensions', service: 'acrylic' },
        { src: 'images/IMG_9923.PNG', alt: 'Signature Mushroom Design', service: 'mushroom-design' },
        { src: 'images/IMG_9924.PNG', alt: 'Crystal & Gems', service: 'nail-art' },
        { src: 'images/IMG_9925.PNG', alt: 'Floral Designs', service: 'nail-art' },
        { src: 'images/IMG_9927.PNG', alt: 'Night Sky Theme', service: 'nail-art' },
        { src: 'images/IMG_9929.PNG', alt: 'Butterfly Patterns', service: 'nail-art' },
        { src: 'images/IMG_9932.PNG', alt: 'Rainbow Effects', service: 'gel' },
        { src: 'images/IMG_9933.PNG', alt: 'Music-Inspired Art', service: 'nail-art' },
        { src: 'images/IMG_9934.PNG', alt: 'Professional Pedicure', service: 'pedicure' },
        { src: 'images/IMG_9936.PNG', alt: 'Artistic Expression', service: 'nail-art' },
        { src: 'images/IMG_9939.PNG', alt: 'Elegant Manicure', service: 'manicure' },
        { src: 'images/IMG_9940.PNG', alt: 'Custom Design', service: 'nail-art' },
        { src: 'images/IMG_9941.PNG', alt: 'Signature Style', service: 'nail-art' }
    ];
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    galleryImages.forEach((imageData, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.className = 'gallery-image';
        img.setAttribute('data-src', imageData.src); // For lazy loading
        img.alt = imageData.alt;
        img.loading = 'lazy';
        
        // Placeholder for lazy loading
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3C/svg%3E';
        
        // Add error handling
        img.onerror = function() {
            console.warn(`Failed to load gallery image: ${imageData.src}`);
            this.style.display = 'none';
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        overlay.innerHTML = `
            <div class="gallery-content">
                <span class="gallery-text">${imageData.alt}</span>
                <i class="fas fa-search-plus gallery-icon"></i>
            </div>
        `;
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        galleryItem.dataset.service = imageData.service;
        
        // Optimized event handlers
        galleryItem.addEventListener('click', () => {
            showImageModal(imageData.src, imageData.alt);
        });
        
        galleryItem.addEventListener('dblclick', () => {
            scrollToBooking(imageData.service);
        });
        
        fragment.appendChild(galleryItem);
    });
    
    galleryGrid.appendChild(fragment);
    
    // Initialize lazy loading
    lazyLoadGallery();
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
    // Real nail art images from the images folder
    const NAIL_ART_IMAGES = [
        'images/IMG_9914.PNG',
        'images/IMG_9917.PNG',
        'images/IMG_9920.PNG',
        'images/IMG_9922.PNG',
        'images/IMG_9923.PNG',
        'images/IMG_9924.PNG',
        'images/IMG_9925.PNG',
        'images/IMG_9927.PNG',
        'images/IMG_9929.PNG',
        'images/IMG_9932.PNG',
        'images/IMG_9933.PNG',
        'images/IMG_9934.PNG',
        'images/IMG_9936.PNG',
        'images/IMG_9939.PNG',
        'images/IMG_9940.PNG',
        'images/IMG_9941.PNG'
    ];
    
    // Create nail art image items
    const createImageItem = (imagePath, index) => {
        const item = document.createElement('div');
        item.className = 'vertical-slider-item';
        
        const img = document.createElement('img');
        img.className = 'vertical-slider-image';
        img.src = imagePath;
        img.alt = `Nail Art Design ${index + 1}`;
        img.title = `Nail Art Design ${index + 1}`;
        img.loading = 'lazy';
        
        // Add error handling for images
        img.onerror = function() {
            console.warn(`Failed to load image: ${imagePath}`);
            this.style.display = 'none';
        };
        
        item.appendChild(img);
        return item;
    };
    
    // Shuffle an array
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };
    
    // Populate a slider with content
    const populateSlider = (containerId, images) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        container.innerHTML = '';
        
        images.forEach((imagePath, index) => {
            const imageItem = createImageItem(imagePath, index);
            container.appendChild(imageItem);
        });
        
        // Set animation direction based on slider
        const isLeftSlider = container.parentElement.classList.contains('left-slider');
        container.style.animation = isLeftSlider ? 
            'scrollDown 45s linear infinite' :
            'scrollUp 45s linear infinite';
    };
    
    // Initialize sliders
    const initSliders = () => {
        try {
            // Create shuffled sets for each slider
            const leftImages = shuffleArray(NAIL_ART_IMAGES);
            const rightImages = shuffleArray(NAIL_ART_IMAGES);
            
            // Duplicate images for continuous scrolling
            const leftImageSet = [...leftImages, ...leftImages];
            const rightImageSet = [...rightImages, ...rightImages];
            
            // Populate sliders
            populateSlider('leftSliderContainer', leftImageSet);
            populateSlider('rightSliderContainer', rightImageSet);
            
            // Add hover pause effect and click to enlarge
            document.querySelectorAll('.vertical-slider-container').forEach(container => {
                container.addEventListener('mouseenter', () => {
                    container.style.animationPlayState = 'paused';
                });
                
                container.addEventListener('mouseleave', () => {
                    container.style.animationPlayState = 'running';
                });
            });
            
            // Add click event to images for modal view
            document.querySelectorAll('.vertical-slider-image').forEach(img => {
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    showImageModal(img.src, img.alt);
                });
            });
            
            console.log('Vertical sliders initialized successfully with real images');
        } catch (error) {
            console.error('Error initializing sliders:', error);
        }
    };
    
    // Initialize immediately
    initSliders();
}

// Image modal functionality
function showImageModal(imageSrc, imageAlt) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img class="image-modal-img" id="modalImage">
                <div class="image-modal-caption" id="modalCaption"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.image-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Show the modal with the image
    const modalImg = modal.querySelector('#modalImage');
    const modalCaption = modal.querySelector('#modalCaption');
    
    modalImg.src = imageSrc;
    modalCaption.textContent = imageAlt;
    modal.style.display = 'block';
}

// Initialize vertical sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeVerticalSliders();
});
