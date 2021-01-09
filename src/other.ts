export function detach(node: Node): Node {
    return node.parentNode.removeChild(node);
}

export function template(template: Element): Element {
    let node = template as HTMLTemplateElement;
    return node.content.cloneNode(true) as Element;
}
