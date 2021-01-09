import {sessionIdentifier, setSessionIdentifier} from './tunnel';

let element = document.getElementById('session-secret');
let field = element as HTMLInputElement;
field.value = sessionIdentifier() || '';

document.getElementById('save').onclick = () => {
    setSessionIdentifier(field.value);
    window.location.href = 'index.html';
};
