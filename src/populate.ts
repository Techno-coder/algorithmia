import {Auxiliary, Problem, SampleCase} from './problem';
import {detach} from './other';

export function auxiliary(main: Element): Auxiliary {
    let auxiliary: Auxiliary = new Auxiliary();
    auxiliary.inputMethod = main.childNodes[2].textContent;
    auxiliary.outputMethod = main.childNodes[6].textContent;
    auxiliary.memoryLimit = main.childNodes[10].textContent;
    auxiliary.timeLimit = main.childNodes[14].textContent;
    return auxiliary;
}

export function samples(main: Element): SampleCase[] {
    let strip = (element: Element) =>
        Array.from(element.getElementsByTagName('span'),
            (span) => span.textContent.trim()).join('\n');

    let nodes = main.getElementsByClassName('samples')[0];
    return Array.from(nodes.children, (item) => {
        let input = strip(item.getElementsByClassName('input')[0]);
        let output = strip(item.getElementsByClassName('output')[0]);
        return {input, output};
    });
}

export function populate(problem: Problem, statement: Element) {
    let selector = ':scope > h1, h2, h3, h4, h5, h6';
    let headings = statement.querySelectorAll(selector);
    let setField = (field) => problem.statement = field;

    headings.forEach((heading) => {
        let content = heading.textContent.toUpperCase();
        let match = (name, set) => {
            if (!content.includes(name)) return;
            setField(splitLeading(heading));
            setField = set;
        };

        match('INPUT', (field) => problem.input = field);
        match('OUTPUT', (field) => problem.output = field);
        match('EXPLANATION', (field) => problem.explanation = field);
        match('CONSTRAINTS', (field) => problem.constraints = field);
        match('SUBTASK', (field) => problem.subtasks = field);
        match('HINT', (field) => problem.hints = field);
    });

    // Set trailing section.
    setField(statement);
}

/**
 * Splits off the leading children of a node.
 * @param vertex The element to split at.
 * The element node is removed.
 */
function splitLeading(vertex: Element): Element {
    let lead = document.createElement('div');
    let node: Node = vertex.previousSibling;

    while (node) {
        let previous = node.previousSibling;
        node = detach(node);
        lead.prepend(node);
        node = previous;
    }

    vertex.remove();
    return lead;
}

