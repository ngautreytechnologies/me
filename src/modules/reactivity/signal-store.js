import { createSignal } from "./signals";
console.log('[SignalStore module loaded]');
export const SIGNAL_STORE_ID = Symbol('SignalStoreID');
console.log('siht', SIGNAL_STORE_ID.toString());

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

// 🔄 Tags updated event (new)
// Used to broadcast when tag list is modified — e.g. tag added, removed, or reordered
export const [getTagsUpdated, setTagsUpdated, subscribeTagsUpdated] = createSignal(null);

