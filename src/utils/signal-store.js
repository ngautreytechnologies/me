import { createSignal } from './signal.js';

// Example shared signal: selected certification
export const [getSelectedCert, setSelectedCert, subscribeSelectedCert] = createSignal(null);

// Example shared signal: toast notifications
export const [getToast, setToast, subscribeToast] = createSignal(null);
