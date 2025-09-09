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

function showSkillExpertise(id) {
    // Get all detail panels
    const details = document.querySelectorAll('.skill-expertise-detail');
    details.forEach(detail => {
        detail.classList.remove('active');
    });

    // Activate the clicked tool's detail panel
    const activeDetail = document.getElementById(`${id}-details`);
    if (activeDetail) {
        activeDetail.classList.add('active');
    }
}

// Optional: add click listeners dynamically
document.querySelectorAll('.skill-expertise-card').forEach(card => {
    card.addEventListener('click', () => {
        const toolId = card.getAttribute('data-tool-id');
        showSkillExpertise(toolId);
    });
});
