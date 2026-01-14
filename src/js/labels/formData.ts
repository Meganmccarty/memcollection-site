import { transformData } from './transformData';

const emptyFormObject = {
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

let formData = { ...emptyFormObject };

export function addChangeEvent(
    elements: NodeListOf<HTMLInputElement> | NodeListOf<HTMLSelectElement>,
) {
    return elements.forEach((element) => {
        element.addEventListener('change', () => {
            formData = {
                ...formData,
                [element.name]: element.value,
            };
        });
    });
}

export async function getApiUrl(): Promise<{ API_URL: string }> {
    const response = await fetch('/api-url.js');
    const data = await response.json();
    return data;
}

export async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    /* Turn the form data object into an array of strings
       in format '${key}=${value}&' */
    let formArray: Array<string> = [];

    Object.entries(formData).forEach((entry) => {
        formArray = [...formArray, `${entry[0]}=${entry[1]}&`];
    });

    /* Convert the array of strings into just one string
       Remove the '&' character on the last string */
    let formString = formArray.join('');
    formString = formString.slice(0, formString.length - 1);

    const apiUrl = await getApiUrl();
    const url = `${apiUrl.API_URL}/specimen-records/?${formString}&limit=10000`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => transformData(data));
}

export function resetForm() {
    formData = { ...emptyFormObject };
}
