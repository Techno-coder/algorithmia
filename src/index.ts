import {DOMAIN_ROOT, fetchPage, sessionIdentifier} from './tunnel';
import {template} from './other';
import {menuButton} from './menu';
import Fuse from 'fuse.js';

class Group {
    link: string;
    name: string;
}

interface ProblemStub {
    item: ProblemItem;
    group: Group;
    set: string;
}

interface ProblemItem {
    link: string;
    name: string;
    score?: string;
}

let groups = document.getElementById('groups');
let searchBox = document.getElementById('search') as HTMLInputElement;
let problems = document.getElementById('problems');

let fuseGroups = new Fuse([], {
    keys: ['link', 'name'],
    minMatchCharLength: 3,
    threshold: 0.1,
})

let fuse = new Fuse([], {
    minMatchCharLength: 3,
    threshold: 0.1,
    keys: [
        'item.link',
        'item.name',
        'group.name',
        'set',
    ],
});

async function index() {
    let page = await fetchPage(DOMAIN_ROOT);
    let main = page.getElementById('main-container');
    let container = main.firstElementChild;

    // Load public problems.
    let open = container.lastElementChild.lastElementChild;
    let link = 'https://train.nzoi.org.nz/groups/0';
    let openGroup = {name: 'Public Problems', link};
    cacheGroup(openGroup, problemStubs(open, openGroup));
    registerGroup(openGroup).catch(console.error);

    if (container.children.length == 2) {
        loadGroups(container.firstElementChild);
    } else {
        let element = (sessionIdentifier() != undefined ?
            document.getElementById('invalid-session-alert') :
            document.getElementById('no-session-alert'));
        element.hidden = false;
    }

    let end = document.getElementById('content-end');
    end.append(menuButton());
}

function loadGroups(column: Element) {
    let heading = column.firstElementChild;
    let element = heading.nextElementSibling;
    while (element != null) {
        let anchor = element.querySelector('a');
        let link = DOMAIN_ROOT + anchor.getAttribute('href');
        let group = {link, name: anchor.textContent};
        registerGroup(group).catch(console.error);
        element = element.nextElementSibling;
    }
}

function groupSelector(group: Group): Element {
    let node = template(document.getElementById('group'));
    let selector = node.querySelector('#group-select') as HTMLElement;

    selector.onclick = () => {
        setSearchBoxValue(group.name);
        populateGroup(group, true).catch(console.error);
    };

    selector.id = group.link;
    selector.textContent = group.name;
    return node;
}

async function registerGroup(group: Group) {
    groups.append(groupSelector(group));
    await populateGroup(group, false);
    fuseGroups.add(group);
    renderGroups();
}

async function populateGroup(group: Group, refresh: boolean) {
    let element = document.getElementById(group.link);
    element.classList.add('animate-pulse');

    if (localStorage.getItem(group.link) == null || refresh)
        await indexGroup(group);

    let stubs = JSON.parse(localStorage.getItem(group.link));
    fuse.remove((stub) => stub.group.link == group.link);
    stubs.forEach((stub) => fuse.add(stub));

    // Render with updated problem indexes.
    element.classList.remove('animate-pulse');
    renderUniqueItems();
}

function cacheGroup(group: Group, stubs: ProblemStub[]) {
    localStorage.setItem(group.link, JSON.stringify(stubs));
}

async function indexGroup(group: Group) {
    let page = await fetchPage(group.link);
    let table = page.querySelector('.main_table');
    cacheGroup(group, problemStubs(table, group));
}

function problemStubs(table: Element, group: Group): ProblemStub[] {
    let body = table.querySelector('tbody');
    let headings = body.querySelectorAll('.subheading');
    return Array.from(headings, ((itemSet) => {
        let set = itemSet.firstElementChild.firstChild.textContent;
        let setTable = itemSet.nextElementSibling.querySelector('tbody');
        return Array.from(setTable.children, (problem) => {
            let anchor = problem.querySelector('a');
            let link = DOMAIN_ROOT + anchor.getAttribute('href');
            let name = anchor.textContent;

            let progress = problem.children[1].firstElementChild;
            let score = progress.lastChild.textContent;
            return {item: {link, name, score}, set, group};
        });
    })).flat();
}

function filter<T>(fuse: Fuse<T>): T[] {
    return searchBox.value.length != 0 ?
        fuse.search(searchBox.value).map((item) => item.item)
        : (fuse as any)._docs;
}

function render() {
    renderGroups();
    renderUniqueItems();
}

function renderGroups() {
    let groupItems = filter(fuseGroups);
    let container = groups.parentElement;
    container.hidden = groupItems.length === 0;

    for (let group of groups.children)
        group.classList.add('hidden');
    groupItems.forEach((group) => {
        let node = document.getElementById(group.link);
        node.classList.remove('hidden');
    });
}

function renderUniqueItems() {
    let links = new Set();
    let items = filter(fuse).map((item) => item.item);
    problems.innerHTML = '';

    let query = searchBox.value;
    if (query.startsWith(DOMAIN_ROOT + '/problems'))
        renderItem({name: query, link: query});

    items.forEach((item) => {
        if (links.has(item.link)) return;
        links.add(item.link);
        renderItem(item);
    });

    let container = problems.parentElement;
    container.hidden = problems.innerHTML == '';
}

function renderItem(item: ProblemItem) {
    let node = template(document.getElementById('problem'));
    node.querySelector('#problem-name').textContent = item.name;
    let link = node.querySelector('#problem-link') as HTMLAnchorElement;
    link.href = `render.html?link=${item.link}`;

    let score = node.querySelector('#problem-score');
    score.textContent = (item.score || '').toString();
    problems.append(node);
}

function setSearchBoxValue(value: string) {
    searchBox.value = value;
    render();
}

searchBox.oninput = render;
index().finally(() => {
    let loader = document.getElementById('loader');
    loader.classList.add('hidden');
});
