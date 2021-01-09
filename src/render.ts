import {Auxiliary, Problem, SampleCase, SubmissionStub} from './problem';
import {fetchPage} from './tunnel';
import {parse} from './parse';
import {template} from './other';
import {authenticityToken, pollPending, postSubmission} from './submit';
import {menuButton} from './menu';

import * as Prism from 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar.min';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min';

let left = document.getElementById('render-left');
let right = document.getElementById('render-right');

function render(problem: Problem, link: string) {
    let appendCard = (parent, name, element?) =>
        element && parent.append(elementCard(name, element));

    appendCard(left, 'Statement', problem.statement);
    appendCard(left, 'Input', problem.input);
    appendCard(left, 'Output', problem.output);
    appendCard(left, 'Hints', problem.hints);
    appendCard(left, 'Explanation', problem.explanation);
    renderSamples(left, problem.samples);

    right.append(auxiliaryCard(problem.auxiliary));
    appendCard(right, 'Constraints', problem.constraints);
    appendCard(right, 'Subtasks', problem.subtasks);
    right.append(informationCard(link, problem.name));
    document.title = `${problem.name} - Algorithmia`;
    Prism.highlightAll();
}

function renderSamples(left: Element, samples: SampleCase[]) {
    for (let index in samples) {
        let card = template(document.getElementById('sample-card'));
        card.querySelector('#sample-input').textContent = samples[index].input;
        card.querySelector('#sample-output').textContent = samples[index].output;
        card.querySelector('#sample-index').textContent = index;
        left.append(card);
    }
}

function auxiliaryCard(auxiliary: Auxiliary): Element {
    let card = template(document.getElementById('auxiliary-card'));
    card.querySelector('#auxiliary-input').textContent = auxiliary.inputMethod;
    card.querySelector('#auxiliary-output').textContent = auxiliary.outputMethod;
    card.querySelector('#auxiliary-memory').textContent = auxiliary.memoryLimit;
    card.querySelector('#auxiliary-time').textContent = auxiliary.timeLimit;
    return card;
}

function informationCard(link: string, name: string): Element {
    let card = template(document.getElementById('information-card'));
    let title = card.querySelector('#link') as HTMLAnchorElement;
    title.textContent = name;
    title.href = link;
    return card;
}

function elementCard(name: string, element: Element): Element {
    let card = template(document.getElementById('blank-card'));
    card.querySelector('#heading').textContent = name;
    card.querySelector('#card').append(element);
    return card;
}

async function load() {
    let link = new URLSearchParams(window.location.search).get('link');
    if (link == null) throw "No problem specified with '?link='";
    let problem = parse(await fetchPage(link));

    render(problem, link);
    loadSubmissions(link, problem.name).catch(console.error);
    let end = document.getElementById('render-right-end');
    end.append(menuButton());
}

async function loadSubmissions(link: string, name: string) {
    let token = await authenticityToken(link);
    if (token == null) return;

    let element = document.getElementById('select-file');
    let select = element as HTMLInputElement;
    select.onchange = async () => {
        if (select.files.length > 0) {
            select.disabled = true;
            let data = select.files[0];
            await postSubmission(link, token, data);
            pollPending(link, name, renderSubmissions, true);
            select.disabled = false;
            select.value = null;
        }
    };

    select.hidden = false;
    pollPending(link, name, renderSubmissions);
}

function renderSubmissions(stubs: SubmissionStub[]) {
    if (stubs.length === 0) return;
    let card = document.getElementById('submissions-card');
    let list = document.getElementById('submissions');
    card.classList.remove('hidden');
    list.innerHTML = '';

    stubs.forEach((stub) => {
        let item = template(document.getElementById('submission-item'));
        (item.querySelector('#submission-link') as HTMLAnchorElement).href = stub.link;
        item.querySelector('#submission-date').textContent = stub.date;

        let score = item.querySelector('#submission-score');
        if (stub.score === undefined) {
            score.textContent = 'Pending';
            score.classList.add('italic');
        } else {
            score.textContent = stub.score.toString();
            if (stub.score === 100) score.classList.add('font-bold');
        }

        list.append(item);
    });
}

function showError(error) {
    console.error(error);
    let node = document.getElementById('error');
    node.hidden = false;
}

load().catch(showError).finally(() => {
    Notification.requestPermission();
    let loader = document.getElementById('loader');
    loader.classList.add('hidden');
});
