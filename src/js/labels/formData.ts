import { SpecimenLabel } from '../types/specimen-label';
import { transformData } from './transformData';

interface LabelForm {
    usi_mode: 'none' | 'include' | 'exclude';
    usi_input_text: string;
    order: string,
    family: string,
    subfamily: string,
    tribe: string,
    genus: string,
    species: string,
    subspecies: string,
    determiner_firstname: string,
    determiner_lastname: string,
    determined_year: number | '',
    preparer_firstname: string,
    preparer_lastname: string,
    preparation: string,
    preparation_date: string,
    sex: string,
    stage: string,
    labels_printed: boolean | '',
    labeled: boolean | '',
    photographed: boolean | '',
    identified: boolean | '',
    country: string,
    state: string,
    county: string,
    locality: string,
    gps_lat: string,
    gps_long: string,
    elevation: string,
    collecting_trip: string,
    day: number | '',
    month: string,
    year: number | '',
    collector_firstname: string,
    collector_lastname: string,
    method: string,
    weather: string,
    temperature: string,
    time_of_day: string,
    habitat: string,
    notes: string,
}

type LabelFormKey = keyof LabelForm;
type FilterableKey = keyof LabelForm & keyof SpecimenLabel;

const emptyFormObject: LabelForm = {
    usi_mode: 'none',
    usi_input_text: '',
    order: '',
    family: '',
    subfamily: '',
    tribe: '',
    genus: '',
    species: '',
    subspecies: '',
    determiner_firstname: '',
    determiner_lastname: '',
    determined_year: '',
    preparer_firstname: '',
    preparer_lastname: '',
    preparation: '',
    preparation_date: '',
    sex: '',
    stage: '',
    labels_printed: '',
    labeled: '',
    photographed: '',
    identified: '',
    country: '',
    state: '',
    county: '',
    locality: '',
    gps_lat: '',
    gps_long: '',
    elevation: '',
    collecting_trip: '',
    day: '',
    month: '',
    year: '',
    collector_firstname: '',
    collector_lastname: '',
    method: '',
    weather: '',
    temperature: '',
    time_of_day: '',
    habitat: '',
    notes: '',
};

let formData: LabelForm = { ...emptyFormObject };

/**
 * Updates the USI filter mode and list
 * @param usiInputText - The user's input text
 */
export function setUsiFilter(usiInputText: string) {
    return new Set(
        usiInputText
            .split(',')
            .map((usi: string) => usi.trim()),
    );
}

/**
 * Adds an onChange event listener to each input/select element within the label form
 * @param elements - A Node list of input elements to watch for changes
 */
export function addChangeEvent(
    elements: NodeListOf<HTMLInputElement> | NodeListOf<HTMLSelectElement>,
) {
    elements.forEach((element) => {
        element.addEventListener('change', () => {
            formData = {
                ...formData,
                [element.name]: element.value,
            };
        });
    });
}

let submitTimeout: NodeJS.Timeout;

/**
 * Handles the submitting of the label generator form
 * @param event - The submit event
 * @param data - The data in the form
 */
export async function handleSubmit(event: SubmitEvent, data: SpecimenLabel[]) {
    event.preventDefault();

    clearTimeout(submitTimeout);

    // Setting a setTimeout to prevent the form from rapidly resubmitting when clicking the
    // submit button (puts a short delay between button clicks). When the form first submits, any
    // previous timeout is cleared above.
    submitTimeout = setTimeout(() => {
        let workingData = data;

        if (formData.usi_mode === 'include' && formData.usi_input_text.length > 0) {
            workingData = workingData.filter((specimen) => (
                setUsiFilter(formData.usi_input_text).has(specimen.usi)
            ));
        } else if (formData.usi_mode === 'exclude' && formData.usi_input_text.length > 0) {
            workingData = workingData.filter((specimen) => (
                !setUsiFilter(formData.usi_input_text).has(specimen.usi)
            ));
        }

        // Filter out the formData to remove any keys that have empty values
        // (as we will only filter on what the user entered) and exclude USI fields
        // (USI filtering is already done above). Using .reduce() to build a single
        // object containing only keys with values
        const filteredFormData = (
            Object.keys(formData) as LabelFormKey[]
        ).reduce<Partial<LabelForm>>((r, key) => {
            // Skip USI-related fields - they're handled separately
            if (key === 'usi_mode' || key === 'usi_input_text') {
                return r;
            }
            if (formData[key]) {
                return { ...r, [key]: formData[key] };
            }
            return r;
        }, {});

        // If all of the keys in the formData object are empty, that means the user hasn't entered
        // anything into the form, so we assume they want a label for every specimen in the
        // database.
        // Else, we filter the specimens using the filteredFormData that the user has entered,
        // and we create labels for only those filtered specimens.
        if (Object.keys(filteredFormData).length === 0) {
            transformData(workingData);
        } else {
            const filteredSpecimens = workingData.filter((specimen: SpecimenLabel) => (
                Object.entries(filteredFormData) as [
                    FilterableKey,
                    LabelForm[FilterableKey],
                ][]
            ).every(([key, value]) => String(specimen[key])
                .toLowerCase()
                .includes(String(value).toLowerCase())));

            transformData(filteredSpecimens);
        }
    }, 100);
}

/**
 * Clears out any values the user inputted into the label form.
 */
export function resetForm() {
    formData = { ...emptyFormObject };
}
