import {Problem} from './problem';
import {DOMAIN_ROOT, tunnelImage} from './tunnel';
import {auxiliary, populate, samples} from './populate';
import * as katex from "katex";

export function parse(document: Document): Problem {
    let main: HTMLElement = document.getElementById('main-container');
    let statement = main.getElementsByClassName('statement')[0];
    remove(statement.getElementsByClassName('js_only'));
    remove(statement.getElementsByTagName('script'));
    resolveLinks(statement, 'img', 'src');
    resolveLinks(statement, 'a', 'href');
    expandAnchorLinks(statement);
    spaceParagraphs(statement);

    // Load domain images through tunnel.
    let images = statement.getElementsByTagName('img');
    for (let index = 0; index < images.length; ++index)
        tunnelImage(images[index] as HTMLImageElement)
            .catch(console.warn);

    // Transform rendered code sections.
    let codes = statement.getElementsByTagName("code");
    for (let code of codes) code.classList.add("language-none");

    // Transform rendered mathematical expressions.
    let maths = statement.getElementsByTagName('noscript');
    let options = {throwOnError: false};
    while (maths.length > 0) {
        let element = maths[0];
        let render = katex.renderToString(element.textContent, options);
        element.parentElement.outerHTML = render;
    }

    let problem = new Problem();
    let titleBox = document.getElementById("main-page-title-box").childNodes;
    problem.name = titleBox[titleBox.length - 2].textContent;
    problem.auxiliary = auxiliary(main);
    problem.samples = samples(main);
    populate(problem, statement);
    return problem;
}

function remove(elements: HTMLCollectionOf<Element>) {
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function spaceParagraphs(container: Element) {
    let paragraphs = container.getElementsByTagName('p');
    for (let element of paragraphs)
        element.classList.add('my-2');
}

/**
 * Roots link attributes to their expected domain.
 */
function resolveLinks(element: Element, tag: string, attribute: string) {
    let elements = element.getElementsByTagName(tag);
    for (let element of elements) {
        let canonicalLink = element.getAttribute(attribute);
        if (canonicalLink.startsWith('/'))
            canonicalLink = DOMAIN_ROOT + canonicalLink;
        element.setAttribute(attribute, canonicalLink);
    }
}

/**
 * Sets all anchors to open in a new page.
 */
function expandAnchorLinks(document: Element) {
    let elements = document.getElementsByTagName('a');
    for (let element of elements)
        element.setAttribute('target', '_blank');
}
