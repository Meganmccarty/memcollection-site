import { SpecimenLabel } from '../types/specimen-label';
import { transformData } from './transformData';

interface LabelForm {
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
    usi: string,
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
    usi: '',
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
 * Adds an onChange event listener to each input/select element within the label form
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

let submitTimeout: number;

export async function handleSubmit(event: SubmitEvent, data: SpecimenLabel[]) {
    event.preventDefault();

    clearTimeout(submitTimeout);

    // Setting a setTimeout to prevent the form from rapidly resubmitting when clicking the
    // submit button (puts a short delay between button clicks). When the form first submits, any
    // previous timeout is cleared above.
    submitTimeout = setTimeout(() => {
        // Filter out the formData above to remove any keys that have empty values
        // (as we will only filter on what the user entered). Using .reduce() to build a single
        // object containing only keys with values
        const filteredFormData = (
            Object.keys(formData) as LabelFormKey[]
        ).reduce<Partial<LabelForm>>((r, key) => {
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
            transformData(data);
        } else {
            const filteredSpecimens = data.filter((specimen: SpecimenLabel) => (
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
