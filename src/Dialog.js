customElements.define('custom-dialog', class extends HTMLElement {
    constructor() {

        super();

    }
});


class Dialog {

    #shadowRootMode;
    #delegatesFocus;
    #style;

    #list;

    constructor({
        shadowRootMode = 'open',
        delegatesFocus = false,
        style = ''
    } = {}) {

        this.#shadowRootMode = shadowRootMode;
        this.#delegatesFocus = delegatesFocus;
        this.#style = style;

        this.#list = {};


        window.addEventListener('click', e => {

            let triggeredDialogs = e.composedPath().filter(tag => tag.tagName == 'CUSTOM-DIALOG').length;

            for (let key of Object.keys(this.#list)) {

                if (!triggeredDialogs && this.#list[key].target && !this.#list[key].persistent && (!e.composedPath().includes(this.#list[key].aside) && !e.composedPath().includes(this.#list[key].target))) {

                    this.#list[key].host.style.display = '';
                    this.#list[key].host.classList.remove('fix');

                }

            }

        });

        window.addEventListener('keydown', e => {

            let keys = Object.keys(this.#list);

            if (keys.length) {

                this.#list[keys.at(-1)].keyDown(e);

            }

        });

        window.addEventListener('keyup', e => {

            let keys = Object.keys(this.#list);

            if (keys.length) {

                this.#list[keys.at(-1)].keyUp(e);

            }

        });

        window.addEventListener('resize', e => {

            for (let key of Object.keys(this.#list)) {

                if (this.#list[key].target && this.#list[key].host.classList.contains('fix')) {

                    this.#list[key].position();

                }

            }

        });

    }


    get list() { return Object.keys(this.#list).reverse(); }
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
        target = null,
        script = () => {},
        persistent = false,
        onClose = () => {},
        onHelp = undefined
    } = {}) {

        let key = crypto.randomUUID();


        let dialog = {
            host: document.createElement('custom-dialog'),
            aside: document.createElement('aside'),
            header: document.createElement('header'),
            title: document.createElement('h1'),
            main: document.createElement('main'),
            footer: document.createElement('footer'),
            help: document.createElement('div'),
            footerContent: document.createElement('section'),
            target,
            persistent,
            shadowRoot: null,
            keyUp: () => {},
            onClose: onClose
        };

        dialog.shadowRoot = dialog.host.attachShadow({
            mode: this.#shadowRootMode, // open | close
            delegatesFocus: this.#delegatesFocus
        });
        dialog.keyDown = e => {

            if (e.key == 'Escape' && !persistent) {

                if (target) {

                    dialog.host.classList.remove('fix');
                    dialog.host.style.display = '';

                } else {

                    this.close(key);

                }

            }

        };


        let css = document.createElement('style');
        css.textContent = this.#style + style + `
            :host, * { margin: 0; padding: 0; box-sizing: border-box; }
            :host { outline: none; border: none; z-index: 999999999; }
            :host > aside { padding: 10px; width: max-content;  height: max-content; background-color: #fff; color: #000; border-radius: 3px; transition: 0.3s; box-shadow: 0 2px 8px rgba(0, 0, 0, .33); display: flex; flex-direction: column; }
            ${target ? `
                :host { display: none; pointer-events: none; position: absolute; width: max-content; height: max-content; background: transparent; }
                :host > aside { pointer-events: auto; max-width: inherit; max-height: inherit; }
            ` : `
                :host { position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.32); backdrop-filter: blur(0.5rem); }
                :host > aside { position: absolute; left: 50%; top: 50%; max-width: calc(100% - 20px); max-height: calc(100% - 20px); transform: translate(-50%, -50%); }
            `}
                    :host > aside > header { position: relative; width: 100%; font-size: 18px; text-align: center; display: flex; align-items: center; z-index: 2; }
                    :host > aside > header > h1 { flex: 1; display: inline-block; height: max-content; font-size: 20px; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
                    :host > aside > header > h1:not(:empty) { padding: 5px 10px; }
                    :host > aside > main { flex: 1; position: relative; padding: 20px; width: 100%; overflow: auto; z-index: 1; }
                    :host > aside > footer { position: relative; width: 100%; display: flex; align-items: center; z-index: 3; }
                    :host > aside > footer > div { outline: none; user-select: none; position: relative; margin: 5px; width: 20px; height: 20px; cursor: pointer; text-align: center; font-size: 14px; color: #333; border: 1px solid #333; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
                    :host > aside > footer > div:hover { transform: scale(1.1) }
                    :host > aside > footer > div:active { transform: scale(1) }
                    :host > aside > footer > section { flex: 1; position: relative; text-align: center; }
                    :host > aside > footer > section:not(:empty) { padding: 10px; }
        `;
        dialog.shadowRoot.append(css);


        if (typeof content == 'string') {

            dialog.main.innerHTML = content;

        } else {

            dialog.main.append(content);

        }

        if (typeof footer == 'string') {

            dialog.footerContent.innerHTML = footer;

        } else {

            dialog.footerContent.append(footer);

        }


        dialog.title.textContent = title;
        dialog.title.title = title;

        dialog.help.textContent = '?';

        dialog.header.append(dialog.title);
        dialog.aside.append(dialog.header);
        dialog.aside.append(dialog.main);
        dialog.aside.append(dialog.footer);
        if (onHelp) dialog.footer.append(dialog.help);
        dialog.footer.append(dialog.footerContent);
        dialog.shadowRoot.append(dialog.aside);
        document.body.append(dialog.host);


        if (target) {

            dialog.position = e => {

                let scrollLeft = window.scrollX || document.body.scrollLeft;
                let scrollTop = window.scrollY || document.body.scrollTop;

                let vl = target.offsetLeft - scrollLeft;
                let vt = target.offsetTop - scrollTop;                

                dialog.host.style = `
                    display: initial;
                    ${(vl <= window.innerWidth / 2) ? `left: `+ (target.offsetLeft + target.clientWidth) : `right: `+ (document.body.clientWidth - target.offsetLeft)}px;
                    ${(vt <= window.innerHeight / 2) ? `top: `+ (target.offsetTop + target.clientHeight) : `bottom: `+ (document.body.clientHeight - target.offsetTop)}px;
                    max-width: calc(100vw - ${(vl > window.innerWidth / 2) ? window.innerWidth - vl : vl + target.clientWidth}px);
                    max-height: calc(100vh - ${(vt > window.innerHeight / 2) ? window.innerHeight - vt : vt + target.clientHeight}px);
                `;

            };

            target.onmouseenter = dialog.position;
            target.onclick = e => {

                dialog.host.style.display = 'initial';
                dialog.host.classList.toggle('fix');

            };
            target.onmouseleave = e => {

                if (!dialog.host.classList.contains('fix')) {

                    dialog.host.style.display = '';

                }

            };

        }


        script(dialog.main, dialog.footerContent);


        dialog.help.onclick = onHelp;


        dialog.host.onclick = e => {

            if (e.composedPath()[0] == dialog.host && (!persistent && !target)) {

                this.close(key);

            }

        };


        // freeze old notifications
        for (let key of Object.keys(this.#list)) {

            if ('duration' in this.#list[key]) {

                clearTimeout(this.#list[key].hide);
                clearTimeout(this.#list[key].close);

                this.#list[key].hide = null;
                this.#list[key].close = null;

            }

        }


        this.#list[key] = dialog;


        return key;

    }

    alert(content, callback = () => {}, {
        title = '',
        style = '',
        script = () => {},
        persistent = false,
        textResolve = 'Ok',
        onClose = () => {},
        onHelp = undefined
    } = {}) {

        let key = this.show(content, {
            title,
            style: style + `
                :host > aside > footer > section { text-align: right; }
                    :host > aside > footer > section > button { position: relative; outline: none; user-select: none; margin-left: 10px; padding: 10px 20px; cursor: pointer; border: none; background-color: #fff; border-radius: 3px; }
                    :host > aside > footer > section > button:hover { color: royalblue; background-color: #eee; }
                    :host > aside > footer > section > button:focus { color: dodgerblue; }
                    :host > aside > footer > section > button.disabled { pointer-events: none; opacity: 0.5; cursor: not-allowed; }
                    :host > aside > footer > section > button.denied { background-color: #ffaaaa; }
                    :host > aside > footer > section > button.waiting { color: rgba(255, 255, 255, 0); background-color: #eee; }
                    :host > aside > footer > section > button.waiting::after { content: ""; position: absolute; width: 16px; height: 16px; top: 0; left: 0; right: 0; bottom: 0; margin: auto; border: 4px solid transparent; border-top-color: #ffffff; border-radius: 50%; animation: button-loading-spinner 1s ease infinite; }
                    @keyframes button-loading-spinner {
                        from {
                            transform: rotate(0turn);
                        }
                        
                        to {
                            transform: rotate(1turn);
                        }
                    }
            `,
            persistent,
            onClose,
            onHelp
        });


        this.#list[key].btnResolve = document.createElement('button');
        this.#list[key].btnResolve.textContent = textResolve;
        this.#list[key].btnResolve.classList.add('disabled');


        Promise.all([script(this.#list[key].main)]).finally(() => this.#list[key].btnResolve.classList.remove('disabled'));


        let resolve = () => {

            this.#list[key].btnResolve.classList.add('waiting');

            Promise.all([callback(true, this.#list[key].main)]).then(e => {

                this.#list[key].btnResolve.classList.remove('waiting');

                if (e.some(e => e == false)) {

                    this.#list[key].btnResolve.classList.add('denied');

                } else {

                    this.close(key);

                }

            }).catch(e => {

                this.#list[key].btnResolve.classList.remove('waiting');
                this.#list[key].btnResolve.classList.add('denied');

            });

        };


        this.#list[key].btnResolve.onmousedown = resolve;
        this.#list[key].btnResolve.onmouseenter = () => this.#list[key].btnResolve.classList.remove('denied');
        this.#list[key].btnResolve.onmouseup = () => this.#list[key].btnResolve.classList.remove('denied');


        this.#list[key].keyDown = e => {

            if (/(Escape|Enter|\s)/i.test(e.key) && !persistent) {

                resolve();

            }

        };
        this.#list[key].keyUp = () => this.#list[key].btnResolve.classList.remove('denied');


        this.#list[key].host.onclick = null;


        this.#list[key].footerContent.appendChild(this.#list[key].btnResolve).focus();

        return key;

    }

    confirm(content, callback = () => {}, {
        title = '',
        style = '',
        script = () => {},
        persistent = false,
        textResolve = 'Ok',
        textReject = 'No',
        onClose = () => {},
        onHelp = undefined
    } = {}) {

        let key = this.alert(content, callback, {
            title,
            style,
            script,
            persistent,
            textResolve,
            onClose,
            onHelp
        });


        this.#list[key].btnReject = document.createElement('button');
        this.#list[key].btnReject.textContent = textReject;


        let resolve = () => {

            this.#list[key].btnResolve.classList.add('waiting');
            this.#list[key].btnReject.classList.add('disabled');

            Promise.all([callback(true, this.#list[key].main)]).then(e => {

                this.#list[key].btnResolve.classList.remove('waiting');
                this.#list[key].btnReject.classList.remove('disabled');

                if (e.some(e => e == false)) {

                    this.#list[key].btnResolve.classList.add('denied');

                } else {

                    this.close(key);

                }

            }).catch(e => {

                this.#list[key].btnResolve.classList.remove('waiting');
                this.#list[key].btnReject.classList.remove('disabled');
                this.#list[key].btnResolve.classList.add('denied');

            });

        };

        this.#list[key].btnResolve.onmousedown = resolve;
        this.#list[key].btnResolve.onmouseenter = () => this.#list[key].btnResolve.classList.remove('denied');
        this.#list[key].btnResolve.onmouseup = () => this.#list[key].btnResolve.classList.remove('denied');
        this.#list[key].btnReject.onclick = () => {

            callback(false, this.#list[key].main);
            this.close(key);

        };


        this.#list[key].keyDown = e => {

            if (e.key == 'Escape' && !persistent) {

                callback(false, this.#list[key].main);
                this.close(key);

            } else if (/(Enter|\s)/i.test(e.key) && !persistent) {

                if (this.#list[key].footerContent.querySelector('button:focus') == this.#list[key].btnReject) {

                    callback(false, this.#list[key].main);
                    this.close(key);

                } else if (this.#list[key].footerContent.querySelector('button:focus') == this.#list[key].btnResolve) {

                    resolve();

                }

            }

        };


        this.#list[key].footerContent.insertBefore(this.#list[key].btnReject, this.#list[key].btnResolve);

        return key;

    }

    notify(content, {
        title = '',
        footer = '',
        style = '',
        script = () => {},
        persistent = false,
        discreet = true,
        duration = null,
        onClose = () => {},
        onHelp = undefined
    } = {}) {

        let key = this.show(content, {
            title,
            footer,
            style: style + `
                :host { pointer-events: none; background: transparent !important; backdrop-filter: none !important; }
                    :host > aside { pointer-events: auto; text-align: center; animation: show 1s forwards; }
                    ${discreet ? `
                        :host > aside { left: 100%; top: initial !important; bottom: 10px; transform: auto; }
                    ` : ``}
                    :host(.hide) aside { animation: hide 1s forwards; }

                ${discreet ? `
                    @keyframes show { from { left: 100%; transform: translateX(0); } to { left: calc(100% - 10px); transform: translateX(-100%); } }
                    @keyframes hide { from { left: calc(100% - 10px); transform: translateX(-100%); } to { left: 100%; transform: translateX(0); } }
                ` : `
                    @keyframes show { from { top: 0; transform: translate(-50%, -100%); } to { top: 10px; transform: translate(-50%, 0); } }
                    @keyframes hide { from { top: 10px; transform: translate(-50%, 0); } to { top: 0; transform: translate(-50%, -100%); } }
                `}
            `,
            script,
            persistent,
            onClose,
            onHelp
        });


        this.#list[key].duration = Math.max(3000, duration == null ? (title +''+ content +''+ footer).replace(/(\s|<\/?[a-z-]+>)/ig, '').length * 150 : duration);


        this.#list[key].hide = setTimeout(() => this.#list[key].host.classList.add('hide'), this.#list[key].duration - 1000);
        this.#list[key].close = setTimeout(() => this.close(key), this.#list[key].duration);


        this.#list[key].host.onclick = null;
        this.#list[key].keyDown = e => {

            if (e.key == 'Escape' && !persistent) {

                clearTimeout(this.#list[key].hide);
                clearTimeout(this.#list[key].close);

                this.#list[key].hide = null;
                this.#list[key].close = null;

                if (!this.#list[key].host.classList.contains('hide')) {

                    this.#list[key].host.classList.add('hide');

                }

                setTimeout(() => this.close(key), 1000);

            }

        };


        return key;

    }

    popUp(content, {
        title = '',
        footer = '',
        style = '',
        script = () => {},
        persistent = false,
        fullScreen = false,
        onClose = () => {},
        onHelp = undefined
    } = {}) {

        let key = this.show(content, {
            title,
            footer,
            style: style + `
                ${fullScreen ? `
                    :host > aside { padding: 0 !important; left: 0 !important; top: 0 !important; transform: none !important; width: 100% !important; max-width: initial !important; height: 100% !important; max-height: initial !important; border-radius: initial !important; }
                    :host > aside > header { flex-direction: row-reverse !important; }
                    :host > aside > header > span { transform: scaleX(-1); }
                    :host > aside > header > span:hover { transform: scaleX(-1) scale(1.1) }
                    :host > aside > footer > div { margin: 10px !important; }
                ` : `
                    :host > aside > header > span:hover { transform: scale(1.1) }
                `}
                
                :host > aside > header > span { outline: none; user-select: none; width: 40px; height: 40px; cursor: pointer; text-align: center; font-size: 18px; font-weight: bold; display: inline-flex; justify-content: center; align-items: center; }
            `,
            script,
            persistent,
            onClose,
            onHelp
        });

        this.#list[key].btnClose = document.createElement('span');
        this.#list[key].btnClose.textContent = fullScreen ? '➜' : '✕';
        this.#list[key].btnClose.onclick = () => {

            this.close(key);

        };

        this.#list[key].header.append(this.#list[key].btnClose);

        return key;

    }

    close(key = null) {

        if (key == null) {

            let keys = Object.keys(this.#list);

            if (keys.length) {

                key = keys.at(-1);

            } else {

                // throw 'Does not exist';
                return null;

            }

        } else {

            if (!(key in this.#list)) {

                // throw 'Is not declared';
                return null;

            }

        }



        this.#list[key].onClose(key);


        if (this.#list[key].target) {

            this.#list[key].target.onmouseenter = null;
            this.#list[key].target.onclick = null;
            this.#list[key].target.onmouseleave = null;
            this.#list[key].position = null;

        }

        if ('btnClose' in this.#list[key]) {

            this.#list[key].btnClose.onclick = null;
            this.#list[key].btnClose.remove();

        }

        if ('btnResolve' in this.#list[key]) {

            this.#list[key].btnResolve.onclick = null;
            this.#list[key].btnResolve.remove();

        }

        if ('btnReject' in this.#list[key]) {

            this.#list[key].btnReject.onclick = null;
            this.#list[key].btnReject.remove();

        }


        this.#list[key].host.onclick = null;
        this.#list[key].shadowRoot = null;
        this.#list[key].keyUp = null;
        this.#list[key].keyDown = null;
        this.#list[key].onClose = null;
        this.#list[key].help.onclick = null;

        this.#list[key].title.remove();
        this.#list[key].header.remove();
        this.#list[key].main.remove();
        this.#list[key].help.remove();
        this.#list[key].footerContent.remove();
        this.#list[key].footer.remove();
        this.#list[key].aside.remove();
        this.#list[key].host.remove();

        
        let res = delete this.#list[key];


        if (res) {

            // unfreeze the most recent notification
            let keys = Object.keys(this.#list);
            if (keys.length) {

                let lastKey = keys.at(-1);

                if ( 'duration' in this.#list[lastKey] && !this.#list[lastKey].hide && !this.#list[lastKey].close) {

                    this.#list[lastKey].hide = setTimeout(() => this.#list[lastKey].host.classList.add('hide'), this.#list[lastKey].duration - 1000);
                    this.#list[lastKey].close = setTimeout(() => this.close(lastKey), this.#list[lastKey].duration);

                }

            }

        }


        return res;

    }

}