/* 
This JavaScript file manages the webage interactivity
*/
function exportPDF() {
    window.print();
}

// Project details functionality
function showProjectDetails(projectId) {
    // Remove active class from all project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('active');
    });

    // Add active class to clicked project card
    event.target.closest('.project-card').classList.add('active');

    // Hide all project details
    document.querySelectorAll('.project-detail').forEach(detail => {
        detail.classList.remove('active');
    });

    // Show selected project details
    document.getElementById(projectId + '-details').classList.add('active');
}

// Add scroll-triggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.section-card');
    cards.forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });

    // Set default active project
    document.querySelector('.project-card').classList.add('active');
});

window.addEventListener('beforeprint', () => {
    // Expand hidden sections, load content, etc.
    document.querySelectorAll('.section-card').forEach(card => {
        card.style.display = 'block';
    });
});
