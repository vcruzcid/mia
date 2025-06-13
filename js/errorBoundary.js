/**
 * Error Boundary Component
 * Handles and displays errors gracefully
 */

class ErrorBoundary {
    constructor() {
        this.errorContainer = null;
        this.init();
    }

    /**
     * Initialize error boundary
     */
    init() {
        // Create error container if it doesn't exist
        if (!document.getElementById('error-boundary')) {
            this.errorContainer = document.createElement('div');
            this.errorContainer.id = 'error-boundary';
            this.errorContainer.className = 'error-boundary';
            document.body.insertBefore(this.errorContainer, document.body.firstChild);
        } else {
            this.errorContainer = document.getElementById('error-boundary');
        }

        // Add global error handlers
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }

    /**
     * Handle JavaScript errors
     * @param {ErrorEvent} event - Error event
     */
    handleError(event) {
        console.error('Error capturado por el límite:', event.error);
        this.showError(event.error);
    }

    /**
     * Handle unhandled promise rejections
     * @param {PromiseRejectionEvent} event - Promise rejection event
     */
    handlePromiseError(event) {
        console.error('Error de promesa capturado:', event.reason);
        this.showError(event.reason);
    }

    /**
     * Display error message
     * @param {Error|string} error - Error object or message
     */
    showError(error) {
        if (!this.errorContainer) return;

        const errorMessage = error.message || 'Ha ocurrido un error inesperado';
        const stackTrace = error.stack || '';

        this.errorContainer.innerHTML = `
            <div class="container">
                <div class="d-flex justify-content-between align-items-start">
                    <h3>Ha ocurrido un error</h3>
                    <button onclick="document.getElementById('error-boundary').style.display='none'" class="btn-close" aria-label="Cerrar"></button>
                </div>
                <p>${errorMessage}</p>
                <pre>${stackTrace}</pre>
                <button onclick="window.location.reload()" class="btn btn-danger">Recargar página</button>
            </div>
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