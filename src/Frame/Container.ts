export default class Container {
  public readonly element: HTMLElement = document.createElement('container');

  public async initialize(): Promise<void> {
    document.body.appendChild(this.element);
  }

  public attachElements(elements: HTMLElement[]) {
    this.element.append(...elements);
  }
}