// ============================================
// DEBUG MODE - Set to false for production
// ============================================
const DEBUG = false;  // 👈 Change to false for live site, true for local testing

function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// ============================================
// TYPING ANIMATION
// ============================================
const titles = ["Senior Software Engineer", "PHP & Laravel Expert", "React & Node.js Developer", "Full Stack Architect"];
let idx = 0, charIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typed-text');

function typeEffect() {
    const current = titles[idx];
    if (isDeleting) { 
        typedEl.textContent = current.substring(0, charIdx - 1); 
        charIdx--; 
    } else { 
        typedEl.textContent = current.substring(0, charIdx + 1); 
        charIdx++; 
    }
    if (!isDeleting && charIdx === current.length) { 
        isDeleting = true; 
        setTimeout(typeEffect, 2000); 
        return; 
    }
    if (isDeleting && charIdx === 0) { 
        isDeleting = false; 
        idx = (idx + 1) % titles.length; 
        setTimeout(typeEffect, 500); 
        return; 
    }
    setTimeout(typeEffect, isDeleting ? 50 : 100);
}
typeEffect();

// ============================================
// THEME TOGGLE (Dark/Light Mode)
// ============================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    if (current === 'dark') { 
        html.removeAttribute('data-theme'); 
        localStorage.setItem('theme', 'light'); 
    } else { 
        html.setAttribute('data-theme', 'dark'); 
        localStorage.setItem('theme', 'dark'); 
    }
}
if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

// ============================================
// SMOOTH SCROLL FOR NAVIGATION
// ============================================
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ============================================
// RESUME BUTTON
// ============================================
document.getElementById('resume-btn')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    alert('📄 Resume PDF available upon request. Connect on LinkedIn!'); 
});

// ============================================
// EMAIL BUTTON (Contact)
// ============================================
document.getElementById('email-btn')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    alert('📧 Reach me at: azharul.ece.hstu@gmail.com'); 
});

// ============================================
// CONTACT FORM AJAX SUBMISSION
// ============================================
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        formStatus.innerHTML = '';
        
        const formData = new FormData(contactForm);
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                formStatus.innerHTML = '✅ Message sent successfully! I\'ll get back to you soon.';
                formStatus.className = 'form-status success';
                contactForm.reset();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'contact',
                        'event_label': 'portfolio_contact'
                    });
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }
        } catch (error) {
            formStatus.innerHTML = '❌ Oops! Something went wrong. Please email me directly at azharul.ece.hstu@gmail.com';
            formStatus.className = 'form-status error';
            debugLog('Form submission error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            
            setTimeout(() => {
                formStatus.innerHTML = '';
                formStatus.className = 'form-status';
            }, 5000);
        }
    });
}

// ============================================
// EVENT TRACKING - See what recruiters click
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. Track ALL button clicks
    const allButtons = document.querySelectorAll('.btn-primary, .contact-btn, .btn-outline');
    
    allButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            let buttonText = this.innerText.trim();
            let buttonHref = this.getAttribute('href') || 'no-link';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'button_click', {
                    'event_category': 'engagement',
                    'event_label': buttonText,
                    'event_value': 1,
                    'button_url': buttonHref
                });
                debugLog('✅ Tracked click:', buttonText);
            }
        });
    });
    
    // 2. Track which sections recruiters view
    const sections = document.querySelectorAll('section, .section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || entry.target.className || 'unknown';
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'section_view', {
                        'event_category': 'scroll_behavior',
                        'event_label': sectionId,
                        'event_value': 1
                    });
                    debugLog('👁️ Viewed section:', sectionId);
                }
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => sectionObserver.observe(section));
    
    // 3. Track external link clicks (GitHub, LinkedIn)
    const externalLinks = document.querySelectorAll('a[href*="github.com"], a[href*="linkedin.com"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            let linkText = this.innerText.trim();
            let linkUrl = this.getAttribute('href');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'external_link', {
                    'event_category': 'outbound',
                    'event_label': linkText,
                    'event_value': 1,
                    'link_url': linkUrl
                });
                debugLog('🔗 External link clicked:', linkText);
            }
        });
    });
    
    // 4. Track time spent on page
    let pageLoadTime = new Date();
    
    window.addEventListener('beforeunload', function() {
        let timeSpent = Math.round((new Date() - pageLoadTime) / 1000);
        if (typeof gtag !== 'undefined' && timeSpent > 5) {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': 'total_time',
                'event_value': timeSpent
            });
            debugLog('⏱️ Time spent:', timeSpent, 'seconds');
        }
    });
    
    // 5. Track email link click
    const emailLink = document.querySelector('#email-btn, a[href*="mailto"]');
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'email_click', {
                    'event_category': 'contact',
                    'event_label': 'email_button',
                    'event_value': 1
                });
                debugLog('📧 Email button clicked');
            }
        });
    }
    
    // 6. Track download resume button
    const resumeBtn = document.querySelector('#resume-btn, a[href*="resume"]');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'resume_download', {
                    'event_category': 'documents',
                    'event_label': 'resume_pdf',
                    'event_value': 1
                });
                debugLog('📄 Resume download attempted');
            }
        });
    }
    
    debugLog('🎯 Event tracking is active! Recruiter actions will be tracked.');
});