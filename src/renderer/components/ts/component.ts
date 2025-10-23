// src/renderer/component/ts/component.ts

/**
 * A reusable function to fetch and inject HTML components into the DOM.
 * It now accepts an optional callback function to run after injection.
 * @param url The path to the HTML component file.
 * @param containerId The ID of the element to inject the component into.
 * @param callback An optional function to execute after the component is loaded.
 */
// 1. MODIFIED: Added 'callback' parameter
const fetchAndInject = (url: string, containerId: string, callback?: () => void): void => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for ${url}`);
      }
      return response.text();
    })
    .then((data: string) => {
      const container: HTMLElement | null = document.getElementById(containerId);
      if (container) {
        container.innerHTML = data;
        // If a callback function was provided, run it now.
        if (callback) {
          callback();
        }
      }
    })
    .catch((error: Error) => {
      console.error(`Error fetching component for #${containerId}:`, error);
      const container: HTMLElement | null = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<p class="p-4 text-red-500">Could not load component.</p>`;
      }
    });
};

/**
 * 2. NEW: This function contains all logic that should run after the sidebar is loaded.
 */
function initializeSidebarLogic(): void {
  const logoutButton = document.getElementById('logout-btn');

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      // Redirect back to the login page
      window.location.href = 'index.html';
    });
  } else {
    console.error('Logout button could not be found.');
  }
}

// --- Load Components ---
// 3. MODIFIED: We now pass our new function as a callback when loading the sidebar.
fetchAndInject('../components/html/sidebar.html', 'sidebar-container', initializeSidebarLogic);
fetchAndInject('../components/html/footer.html', 'footer-container');

// --- Load Backend Scripts ---
// Since TypeScript files are compiled to JavaScript, we load the compiled JS files instead
const loadBackendScript = (scriptPath: string): void => {
  const script = document.createElement('script');
  script.src = scriptPath.replace('.ts', '.js'); // Load the compiled JS file
  script.defer = true;
  document.head.appendChild(script);
};

// Load dashboard backend script if on dashboard page
if (window.location.pathname.includes('dashboard.html')) {
  loadBackendScript('../../../dist/renderer/backend/dashboard.js');
}

// Load students backend script if on students page
if (window.location.pathname.includes('students.html')) {
  loadBackendScript('../../../dist/renderer/backend/students.js');
}
