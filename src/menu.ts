import hotkeys from 'hotkeys-js';

export function menuButton(): Element {
    let node = document.createElement('div');
    node.innerHTML = 'Press <b>/</b> for help';
    node.classList.add('border', 'hover:border-gray-800');
    node.classList.add('card', 'text-center');

    document.body.append(menuModal());
    node.onclick = toggleMenu;
    return node;
}

function toggleMenu() {
    let element = document.getElementById('menu');
    element.hidden = !element.hidden;
}

function menuModal(): Element {
    let heading = document.createElement('div');
    heading.classList.add('card-heading');
    heading.textContent = 'Menu';

    let node = document.createElement('div');
    node.classList.add('modal');
    node.hidden = true;
    node.id = 'menu';
    node.append(heading);
    menuItems(node);

    let container = document.createElement('div');
    container.classList.add('modal-container');
    container.append(node);
    return container;
}

function menuItems(node: Element) {
    node.append(menuItem('Open Problem', () =>
        window.location.href = 'index.html', 'O'));
    node.append(menuItem('Authenticate', () =>
        window.location.href = 'authenticate.html'));
    node.append(menuItem('Clear caches', () =>
        localStorage.clear()));
    node.append(menuItem('Help', toggleMenu, '/'));
}

function menuItem(label: string, run: () => void, bind?: string): Element {
    let item = document.createElement('div');
    item.classList.add('item');
    if (bind != undefined) {
        hotkeys(bind, () => run());
        item.innerHTML = `<b>${bind}</b> - `;
    }

    item.innerHTML += label;
    item.onclick = () => {
        toggleMenu();
        run();
    };

    return item;
}
