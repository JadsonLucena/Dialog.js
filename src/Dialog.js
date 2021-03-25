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

        let key = performance.now();

        let dialog = {
            host: document.createElement('custom-dialog'),
            aside: document.createElement('aside'),
            header: document.createElement('header'),
            title: document.createElement('h1'),
            main: document.createElement('main'),
            footer: document.createElement('footer'),
            shadowRoot: null
        };

        dialog.shadowRoot = dialog.host.attachShadow({
            mode: this.#shadowRootMode, // open | close
            delegatesFocus: this.#delegatesFocus
        });


        let css = document.createElement('style');
        css.textContent = `
            :host, :host * { margin: 0; padding: 0; box-sizing: border-box; }
            :host { outline: none; position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.32); backdrop-filter: blur(0.5rem); overflow: hidden; border: none; z-index: 999999999; }
                :host > aside { position: absolute; padding: 10px; background-color: #fff; color: #000; transition: 0.3s; box-shadow: 0 2px 8px rgba(0, 0, 0, .33); display: flex; flex-direction: column; }
                ${fullScreen ? `
                    :host > aside { padding: 0; width: 100%; height: 100%; }
                ` : `
                    :host > aside { left: 50%; top: 50%; transform: translate(-50%, -50%); width: max-content; max-width: calc(100% - 20px); height: max-content; max-height: calc(100% - 20px); border-radius: 3px; }
                `}
                    :host > aside > header { position: relative; width: 100%; font-size: 18px; text-align: center; display: flex; flex-direction: row; align-items: center; /*border-bottom: 1px solid #eee;*/ z-index: 2; }
                    :host > aside > header > h1 { display: inline-block; padding: 0 10px; width: 100%; height: max-content; font-size: 20px; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
                    :host > aside > main { flex: 1; position: relative; padding: 10px; width: 100%; overflow: auto; z-index: 1; }
                    :host > aside > footer { position: relative; padding: 5px; width: 100%; text-align: center; /*border-bottom: 1px solid #eee;*/ z-index: 3; }
                    :host > aside > footer:empty { padding: 0; }
        ` + style + this.#style;
        dialog.shadowRoot.append(css);


        if (typeof content == 'string') {

            dialog.main.innerHTML = content;

        } else {

            dialog.main.append(content);

        }

        if (typeof footer == 'string') {

            dialog.footer.innerHTML = footer;

        } else {

            dialog.footer.append(footer);

        }


        dialog.title.textContent = title;
        dialog.title.title = title;

        dialog.header.append(dialog.title);
        dialog.aside.append(dialog.header);
        dialog.aside.append(dialog.main);
        dialog.aside.append(dialog.footer);
        dialog.shadowRoot.append(dialog.aside);
        document.body.append(dialog.host);


        script(dialog.main, dialog.footer);


        dialog.host.onclick = e => {

            if (e.path[0] == dialog.host && !persistent) {

                this.close(key);

            }

        };

        this.#dialogs[key] = dialog;

        return key;

    }

    close(key = null) {

        if (key == null) {

            let keys = Object.keys(this.#dialogs);

            if (keys.length) {

                key = keys.pop();

            } else {

                // throw 'Does not exist';
                return null;

            }

        } else {

            if (!(key in this.#dialogs)) {

                // throw 'Is not declared';
                return null;

            }

        }


        let dialog = this.#dialogs[key];


        dialog.host.onclick = null;
        dialog.shadowRoot = null;
        dialog.keyUp = null;
        dialog.keyDown = null;

        dialog.title.remove();
        dialog.header.remove();
        dialog.main.remove();
        dialog.footer.remove();
        dialog.aside.remove();
        dialog.host.remove();

        return delete this.#dialogs[key];

    }

}