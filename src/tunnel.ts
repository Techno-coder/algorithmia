import * as Cookies from 'js-cookie';

export const DOMAIN_ROOT = 'https://train.nzoi.org.nz';
const ROUTER = 'https://technocoder-cors-bypass.herokuapp.com/';
const SESSION_KEY_SECRET = 'session_secret';

export async function tunnelImage(element: HTMLImageElement) {
    let response = await fetch(ROUTER + element.src, requestMetadata());
    if (!response.ok) throw Error(response.statusText);
    element.src = URL.createObjectURL(response.blob());
}

export async function fetchPage(link: string): Promise<Document> {
    let response = await fetch(ROUTER + link, requestMetadata());
    if (!response.ok) throw Error(response.statusText);

    let parser = new DOMParser();
    let data = await response.text();
    return parser.parseFromString(data, 'text/html');
}

export async function postData(link: string, data: FormData) {
    let metadata = requestMetadata();
    metadata.method = 'POST';
    metadata.body = data;

    let response = await fetch(ROUTER + link, metadata);
    if (!response.ok) throw Error(response.statusText);
}

export function setSessionIdentifier(secret: string) {
    if (secret.trim().length == 0)
        return Cookies.remove(SESSION_KEY_SECRET);
    Cookies.set(SESSION_KEY_SECRET, secret);
}

export function sessionIdentifier(): string | undefined {
    return Cookies.get(SESSION_KEY_SECRET);
}

function requestMetadata(): RequestInit {
    let request: RequestInit = {};
    let session = sessionIdentifier();
    if (session == null) return request;

    request.credentials = 'include';
    request.headers = {'Forward-Cookie': `_session_id=${session}`};
    return request as RequestInit;
}

