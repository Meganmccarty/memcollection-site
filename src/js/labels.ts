import { addChangeEvent, handleSubmit, resetForm } from './labels/formData';
import { SpecimenLabel } from './types/specimen-label';

/**
 * Initializes the label form, including fetching all of the specimen data
 */
export async function initializeForm() {
    const form = document.getElementById('label-form');
    const clearFormBtn = form?.querySelector('button[type=reset]');
    const inputs = form?.querySelectorAll('input');
    const selects = form?.querySelectorAll('select');

    async function fetchSpecimensForLabels(): Promise<SpecimenLabel[]> {
        const response = await fetch('/specimens-data-labels.js');
        const data = await response.json();
        return data;
    }

    const data = await fetchSpecimensForLabels();

    if (form && clearFormBtn) {
        clearFormBtn.addEventListener('click', () => resetForm());
    }

    if (inputs && selects) {
        [inputs, selects].forEach((array) => addChangeEvent(array));
    }

    form?.addEventListener('submit', (e) => handleSubmit(e, data));
}

document.addEventListener('DOMContentLoaded', initializeForm);
