import { addChangeEvent, handleSubmit, resetForm } from './labels/formData';
import { SpecimenLabel } from './types/specimen-label';

async function fetchSpecimensForLabels(): Promise<SpecimenLabel[]> {
    const response = await fetch('/specimens-data-labels.js');
    return response.json();
}

export async function initializeForm() {
    const form = document.getElementById('label-form');
    const clearFormBtn = form?.querySelector('button[type=reset]');
    const inputs = form?.querySelectorAll('input');
    const selects = form?.querySelectorAll('select');

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
