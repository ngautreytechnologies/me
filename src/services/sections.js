/* 
This JavaScript file manages the webage interactivity
*/

// Project details functionality
function showProjectDetails(id) {
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
    document.getElementById(id + '-details').classList.add('active');
}
