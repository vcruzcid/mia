/**
 * Form Validation Module
 * Handles form validation and error messages
 */

class FormValidator {
    constructor() {
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s]{2,50}$/
            },
            email: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            },
            message: {
                required: false,
                maxLength: 1000
            }
        };

        this.errorMessages = {
            name: {
                required: 'El nombre es obligatorio',
                minLength: 'El nombre debe tener al menos 2 caracteres',
                maxLength: 'El nombre no puede exceder los 50 caracteres',
                pattern: 'El nombre solo puede contener letras y espacios'
            },
            email: {
                required: 'El email es obligatorio',
                pattern: 'Por favor, introduce un email válido'
            },
            message: {
                maxLength: 'El mensaje no puede exceder los 1000 caracteres'
            }
        };
    }

    validateField(field, value) {
        const rules = this.validationRules[field];
        const errors = [];

        if (rules.required && !value) {
            errors.push(this.errorMessages[field].required);
            return errors;
        }

        if (value) {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(this.errorMessages[field].minLength);
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(this.errorMessages[field].maxLength);
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(this.errorMessages[field].pattern);
            }
        }

        return errors;
    }

    validateForm(formData) {
        const errors = {};
        let isValid = true;

        for (const [field, value] of formData.entries()) {
            if (this.validationRules[field]) {
                const fieldErrors = this.validateField(field, value);
                if (fieldErrors.length > 0) {
                    errors[field] = fieldErrors;
                    isValid = false;
                }
            }
        }

        return { isValid, errors };
    }

    showErrors(form, errors) {
        // Clear previous errors
        this.clearErrors(form);

        // Show new errors
        for (const [field, fieldErrors] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                
                const errorContainer = document.createElement('div');
                errorContainer.className = 'invalid-feedback';
                errorContainer.setAttribute('role', 'alert');
                errorContainer.setAttribute('aria-live', 'assertive');
                
                fieldErrors.forEach(error => {
                    const errorMessage = document.createElement('div');
                    errorMessage.textContent = error;
                    errorContainer.appendChild(errorMessage);
                });

                input.parentNode.appendChild(errorContainer);
            }
        }
    }

    clearErrors(form) {
        // Remove all error classes
        form.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
        });

        // Remove all error messages
        form.querySelectorAll('.invalid-feedback').forEach(error => {
            error.remove();
        });
    }

    setupFormValidation(form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const formData = new FormData(form);
            const { isValid, errors } = this.validateForm(formData);

            if (isValid) {
                // Form is valid, proceed with submission
                return true;
            } else {
                // Show errors
                this.showErrors(form, errors);
                return false;
            }
        });

        // Real-time validation
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => {
                const formData = new FormData();
                formData.append(input.name, input.value);
                
                const { errors } = this.validateForm(formData);
                if (errors[input.name]) {
                    this.showErrors(form, { [input.name]: errors[input.name] });
                } else {
                    input.classList.remove('is-invalid');
                    const errorContainer = input.parentNode.querySelector('.invalid-feedback');
                    if (errorContainer) {
                        errorContainer.remove();
                    }
                }
            });
        });
    }
}

export default FormValidator; 