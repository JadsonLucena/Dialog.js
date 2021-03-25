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

}