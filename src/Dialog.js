customElements.define('custom-dialog', class extends HTMLElement {
    constructor() {

        super();

    }
});


class Dialog {

    #shadowRootMode;
    #delegatesFocus;
    #style;

    #dialogs;

    constructor({
        shadowRootMode = 'open',
        delegatesFocus = false,
        style = ''
    } = {}) {

        this.#shadowRootMode = shadowRootMode;
        this.#delegatesFocus = delegatesFocus;
        this.#style = style;

        this.#dialogs = {};

    }


    get dialogs() { return Object.keys(this.#dialogs).reverse(); }
    get shadowRootMode() { return this.#shadowRootMode; }
    get delegatesFocus() { return this.#delegatesFocus; }
    get style() { return this.#style; }


    set shadowRootMode(shadowRootMode = 'open') { this.#shadowRootMode = shadowRootMode; }
    set delegatesFocus(delegatesFocus = false) { this.#delegatesFocus = delegatesFocus; }
    set style(style = '') { this.#style = style; }


    show(content, {
        title = '',
        footer = '',
        style = '',
        script = () => {},
        persistent = false,
        fullScreen = false
    } = {}) {

    }

}