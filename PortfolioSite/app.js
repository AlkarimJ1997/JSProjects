// Selectors
const themeDots = document.querySelectorAll('.theme__dot');
const styleSheet = document.getElementById("theme__style");

// Get existing theme from local storage (if any)
const theme = localStorage.getItem('theme') || "light";

// Change theme when page loads
changeTheme(theme);

// Helper function to change the theme of the site
function changeTheme(mode) {
    // If they choose light mode (default), don't change the theme
    if (mode === 'light') {
        styleSheet.href = "";
        return;
    }

    styleSheet.href = `${mode}.css`;
}

themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const mode = dot.dataset.mode;

        // Change the theme based on the mode
        changeTheme(mode);

        // Save the mode to local storage
        localStorage.setItem('theme', mode);
    });
})