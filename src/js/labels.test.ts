/** @jest-environment jsdom */
import { expect } from '@jest/globals';
import { initializeForm } from './labels';
import { addChangeEvent, handleSubmit, resetForm } from './labels/formData';

jest.mock('./labels/formData', () => ({
    addChangeEvent: jest.fn(),
    handleSubmit: jest.fn(),
    resetForm: jest.fn(),
}));

global.fetch = jest.fn();

describe('initializeForm', () => {
    let form: HTMLFormElement;
    let clearFormBtn: HTMLButtonElement;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="label-form">
                <input name="species" />
                <select name="country"><option value="USA">USA</option></select>
                <button type="reset">Clear</button>
            </form>
        `;

        form = document.getElementById('label-form') as HTMLFormElement;
        clearFormBtn = form.querySelector('button[type=reset]') as HTMLButtonElement;

        (global.fetch as jest.Mock).mockResolvedValue({
            json: jest.fn().mockResolvedValue([{ species: 'test' }]),
        });

        jest.clearAllMocks();
    });

    it('fetches specimen data on initialization', async () => {
        await initializeForm();
        expect(global.fetch).toHaveBeenCalledWith('/specimens-data-labels.js');
    });

    it('attaches change event listeners to inputs and selects', async () => {
        await initializeForm();
        expect(addChangeEvent).toHaveBeenCalledTimes(2);
    });

    it('calls resetForm when the clear button is clicked', async () => {
        await initializeForm();
        clearFormBtn.click();
        expect(resetForm).toHaveBeenCalled();
    });

    it('calls handleSubmit when the form is submitted', async () => {
        await initializeForm();
        form.dispatchEvent(new Event('submit'));
        expect(handleSubmit).toHaveBeenCalled();
    });

    it('does not throw if form element is missing', async () => {
        document.body.innerHTML = '';
        await expect(initializeForm()).resolves.not.toThrow();
    });
});
