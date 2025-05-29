// POST.JS for Post Form in Archive Page browser extension
// © JOHN NAVAS 2025, ALL RIGHTS RESERVED 

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    if (url && isValidUrl(url)) {
        const form = document.getElementById('archiveForm');
        document.getElementById('urlInput').value = url;

        // Show submitting message
        const submittingMsg = document.getElementById('submittingMsg');
        if (submittingMsg) {
            submittingMsg.style.display = 'block';
        }

        // Show timeout message after 15 seconds if still on page
        setTimeout(() => {
            const timeoutMsg = document.getElementById('timeoutMsg');
            if (timeoutMsg) {
                timeoutMsg.style.display = 'block';
            }
        }, 15000);

        // Log form data before submission
        setTimeout(() => {
            const formData = new FormData(form);
            const entries = [...formData.entries()];
            console.log('Submitting form with data:');
            entries.forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
            });

            form.submit();
        }, 500); // 500ms delay to allow message rendering
    } else {
        document.body.textContent = 'Invalid or no URL provided.';
    }
});
