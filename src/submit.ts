import {SubmissionStub} from './problem';
import {DOMAIN_ROOT, fetchPage, postData, sessionIdentifier} from './tunnel';

const LANGUAGE_CPP = '11';
const SUBMIT_INTERVAL = 3000;

let timer: number | null = null;

export async function submissions(base: string): Promise<SubmissionStub[]> {
    let page = await fetchPage(base + '/submissions');
    let table = page.querySelector('.main_table');
    let rows = table.querySelector('tbody').rows;

    let stubs = [];
    for (let index = rows.length - 1; index >= 1; --index) {
        let row = rows[index] as HTMLTableRowElement;
        let link_element = row.cells[1].childNodes[1] as HTMLAnchorElement;
        let link = DOMAIN_ROOT + link_element.getAttribute('href');
        let date = link_element.textContent;

        let score = parseInt(row.cells[2].textContent);
        score = isNaN(score) ? undefined : score;
        stubs.push({link, date, score});
    }

    return stubs;
}

export async function postSubmission(base: string, token: string, data: File) {
    let form = new FormData();
    form.set('authenticity_token', token);
    form.set('submission[language_id]', LANGUAGE_CPP);
    form.set('submission[source_file]', data);
    await postData(base + '/submit', form);
}

export async function authenticityToken(base: string): Promise<string | null> {
    if (sessionIdentifier() === undefined) return null;
    let page = await fetchPage(base + '/submit');
    let element = page.querySelector('[name="csrf-token"]');
    return element.getAttribute('content');
}

/**
 * Polls the server for completed submissions if the
 * latest submission is pending. Guaranteed to render
 * at least once.
 */
export function pollPending(base: string, name: string,
                            render: (stubs: SubmissionStub[]) => void,
                            notify: boolean = false) {
    if (timer != null) clearTimeout(timer);
    submissions(base).then((stubs) => {
        render(stubs);
        if (stubs.length == 0) return;
        let stub = stubs[0];

        if (stub.score == null) {
            timer = setTimeout(pollPending,
                SUBMIT_INTERVAL, base, name, render, true);
        } else if (notify) {
            let notification = new Notification(name, {
                body: `Score: ${stub.score}`,
                requireInteraction: true,
            });

            let click = () => window.open(stub.link, '_blank');
            notification.onclick = click;
        }
    });
}
