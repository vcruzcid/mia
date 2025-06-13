/**
 * Error Boundary Component
 * Handles and displays errors gracefully
 */

class ErrorBoundary {
    constructor() {
        this.errorContainer = null;
    }

    /**
     * Initialize error boundary
     * @param {string} containerId - ID of the container to show errors in
     */
    init(containerId = 'error-boundary') {
        this.errorContainer = document.getElementById(containerId);
        if (!this.errorContainer) {
            this.errorContainer = document.createElement('div');
            this.errorContainer.id = containerId;
            this.errorContainer.className = 'error-boundary';
            document.body.insertBefore(this.errorContainer, document.body.firstChild);
        }

        // Add global error handler
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }

    /**
     * Handle JavaScript errors
     * @param {ErrorEvent} event - Error event
     */
    handleError(event) {
        console.error('Error caught by boundary:', event.error);
        this.showError(event.error);
        event.preventDefault();
    }

    /**
     * Handle unhandled promise rejections
     * @param {PromiseRejectionEvent} event - Promise rejection event
     */
    handlePromiseError(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.showError(event.reason);
        event.preventDefault();
    }

    /**
     * Display error message
     * @param {Error|string} error - Error object or message
     */
    showError(error) {
        if (!this.errorContainer) return;

        const errorMessage = error instanceof Error ? error.message : error;
        const stackTrace = error instanceof Error ? error.stack : '';

        this.errorContainer.innerHTML = `
            <h3>Ha ocurrido un error</h3>
            <p>${errorMessage}</p>
            ${stackTrace ? `<pre>${stackTrace}</pre>` : ''}
            <button class="btn btn-red" onclick="window.location.reload()">Recargar página</button>
        `;

        this.errorContainer.style.display = 'block';
    }

    /**
     * Clear error message
     */
    clearError() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.innerHTML = '';
        }
    }
}

export default ErrorBoundary; 