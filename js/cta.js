// Export to PDF functionality
function exportPDF() {
    window.print();
}

// Contact Me functionality with pre-filled email and subject
function contactMe() {
    const email = 'ngautreytechnologies@gmail.com';
    const subject = encodeURIComponent('Reaching Out - Portfolio Website');
    const body = encodeURIComponent('I wanted to reach out regarding...');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
