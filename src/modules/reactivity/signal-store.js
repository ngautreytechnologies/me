import { createSignal } from "./signals";

// Example shared signal: selected certification
export const [getSelectedCert, setSelectedCert, subscribeSelectedCert] = createSignal(null);

// Example shared signal: toast notifications
export const [getToast, setToast, subscribeToast] = createSignal(null);

// Selected skill signal
export const [getSelectedSkill, setSelectedSkill, subscribeSelectedSkill] = createSignal(null);

// Technology tags
export const [getSelectedTechnologyTopic, setSelectedTechnologyTopic, subscribeSelectedTechnologyTopic] = createSignal(null);

// Selected project signal (new)
export const [getSelectedProject, setSelectedProject, subscribeSelectedProject] = createSignal(null);
