customElements.define('custom-dialog', class extends HTMLElement {
    constructor() {

        super();

    }
});


class Dialog {

    #shadowRootMode;
    #delegatesFocus;

    #list;

    constructor({
        shadowRootMode = 'open',
        delegatesFocus = false,
    } = {}) {

        this.shadowRootMode = shadowRootMode;
        this.delegatesFocus = delegatesFocus;

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


    set shadowRootMode(mode = 'open') {

        document.createElement('div').attachShadow({
            mode
        });

        this.#shadowRootMode = mode;

    }
    set delegatesFocus(delegatesFocus = false) {

        document.createElement('div').attachShadow({
            mode: 'open',
            delegatesFocus
        });

        this.#delegatesFocus = delegatesFocus;

    }


    show(content, {
        title = '',
        footer = '',
        mainStyle = '',
        footerStyle = '',
        target,
        script = () => {},
        persistent = false,
        onClose = () => {},
        onHelp
    } = {}) {

        if (typeof content != 'string' && !(content instanceof HTMLElement)) {

            throw new TypeError('Unsupported content');

        } else if (title && typeof title != 'string') {

            throw new TypeError('Unsupported title');

        } else if (footer && typeof footer != 'string' && !(footer instanceof HTMLElement)) {

            throw new TypeError('Unsupported footer');

        } else if (mainStyle && typeof mainStyle != 'string') {

            throw new TypeError('Unsupported mainStyle');

        } else if (footerStyle && typeof footerStyle != 'string') {

            throw new TypeError('Unsupported footerStyle');

        } else if (target && !(target instanceof HTMLElement)) {

            throw new TypeError('Unsupported target');

        } else if (script && !(script instanceof Function)) {

            throw new TypeError('Unsupported script');

        } else if (onClose && !(onClose instanceof Function)) {

            throw new TypeError('Unsupported onClose');

        } else if (onHelp && !(onHelp instanceof Function)) {

            throw new TypeError('Unsupported onHelp');

        }


        let key = crypto.randomUUID();


        let dialog = {
            host: document.createElement('custom-dialog'),
            shadowRoot: null,
            aside: document.createElement('aside'),
            header: document.createElement('header'),
            title: document.createElement('h1'),
            main: document.createElement('main'),
            shadowMain: null,
            footer: document.createElement('footer'),
            help: document.createElement('div'),
            footerContent: document.createElement('section'),
            shadowFooter: document.createElement('section'),
            target,
            persistent,           
            keyUp: () => {},
            onClose: onClose
        };

        dialog.shadowRoot = dialog.host.attachShadow({
            mode: this.#shadowRootMode, // open | close
            delegatesFocus: this.#delegatesFocus
        });
        dialog.shadowMain = dialog.main.attachShadow({
            mode: 'open'
        });
        dialog.shadowFooter = dialog.footerContent.attachShadow({
            mode: 'open'
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
        css.textContent = `
            :host, * { margin: 0; padding: 0; box-sizing: border-box; }
            :host { outline: none; border: none; z-index: 999999999; }
            :host > aside { padding: 10px; width: max-content;  height: max-content; background-color: #fff; color: #000; border-radius: 3px; transition: 0.3s; box-shadow: 0 2px 8px rgba(0, 0, 0, .33); display: flex; flex-direction: column; }
            ${target ? `
                :host { display: none; pointer-events: none; position: absolute; width: max-content; max-width: calc(100vw - 20px); height: max-content; background: transparent; }
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


        if (typeof content == 'string' && content.trim()) {

            dialog.shadowMain.innerHTML = `
                <style>
                ${mainStyle}
                </style>
                ${content}
            `;

        } else if (content instanceof HTMLElement) {

            let css = document.createElement('style');
            css.textContent = mainStyle;
            dialog.shadowMain.append(css);

            dialog.shadowMain.append(content);

        }

        if (typeof footer == 'string' && footer.trim()) {

            dialog.shadowFooter.innerHTML = `
                <style>
                ${footerStyle}
                </style>
                ${footer}
            `;

        } else if (footer instanceof HTMLElement) {

            let css = document.createElement('style');
            css.textContent = footerStyle;
            dialog.shadowFooter.append(css);

            dialog.shadowFooter.append(footer);

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

        if (target) {

            target.append(dialog.host);

        } else {

            document.body.append(dialog.host);

        }


        if (target) {

            dialog.position = e => {

                let boundBox = e.composedPath().find(box => ['auto', 'hidden', 'inherit', 'overlay', 'scroll'].includes(window.getComputedStyle(box).overflow) || box.tagName == 'BODY');

                if (target == boundBox) {

                    dialog.host.style = `
                        display: initial;
                        left: ${Math.round(target.scrollLeft)}px;
                        top: ${Math.round(target.scrollTop)}px;
                        max-width: ${Math.round(boundBox.clientWidth)}px;
                        max-height: ${Math.round(boundBox.clientHeight)}px;
                    `;

                } else {

                    let parentRect;
                    let margin = 20;

                    if (boundBox.tagName == 'BODY') {

                        parentRect = {
                            width: boundBox.getBoundingClientRect().width,
                            height: boundBox.getBoundingClientRect().height
                        }
                        parentRect.x = parentRect.left = document.body.offsetLeft;
                        parentRect.y = parentRect.top = document.body.offsetTop;
                        parentRect.right = parentRect.left + parentRect.width;
                        parentRect.bottom = parentRect.top + parentRect.height;

                    } else {

                        parentRect = boundBox.getBoundingClientRect();

                    }

                    let targetRect = {
                        width: target.getBoundingClientRect().width,
                        height: target.getBoundingClientRect().height
                    };
                    targetRect.x = targetRect.left = target.getBoundingClientRect().left - parentRect.left;
                    targetRect.y = targetRect.top = target.getBoundingClientRect().top - parentRect.top;
                    targetRect.right = targetRect.left + targetRect.width;
                    targetRect.bottom = targetRect.top + targetRect.height;

                    let centerOfTarget = {
                        x: targetRect.left + targetRect.width / 2,
                        y: targetRect.top + targetRect.height / 2
                    }

                    let centerOfParent = {
                        x: parentRect.width / 2,
                        y: parentRect.height / 2
                    }

                    dialog.host.style = `
                        display: initial;
                        ${(centerOfTarget.x < centerOfParent.x) ? `left` : `right`}: 50%;
                        transform: translateX(${(centerOfTarget.x < centerOfParent.x) ? `max(-50%, -${Math.round(centerOfTarget.x - margin / 2)}px)` : `min(50%, ${Math.round(parentRect.width - centerOfTarget.x - margin / 2)}px)`});
                        ${(centerOfTarget.y < centerOfParent.y) ? `top: calc(100% + 5px)`: `bottom: calc(100% + 5px)`};
                        max-width: ${Math.round(parentRect.width - margin)}px;
                        max-height: ${Math.round((centerOfTarget.y < centerOfParent.y) ? (parentRect.height - targetRect.bottom) : targetRect.top) - margin}px;
                    `;

                }

            };

            target.onmouseenter = dialog.position;
            target.onclick = e => {

                let triggeredDialogs = e.composedPath().filter(tag => tag.tagName == 'CUSTOM-DIALOG').length;

                if (!triggeredDialogs) {

                    dialog.host.style.display = 'initial';
                    dialog.host.classList.toggle('fix');

                }

            };
            target.onmouseleave = e => {

                if (!dialog.host.classList.contains('fix')) {

                    dialog.host.style.display = '';

                }

            };

        }


        script(dialog.shadowMain, dialog.shadowFooter);


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
        mainStyle = '',
        script = () => {},
        persistent = false,
        textResolve = 'Ok',
        onClose = () => {},
        onHelp
    } = {}) {

        if (typeof textResolve != 'string' || !textResolve.trim()) {

            throw new TypeError('Unsupported textResolve');

        }


        let key = this.show(content, {
            title,
            mainStyle,
            persistent,
            onClose,
            onHelp
        });


        let css = document.createElement('style');
        css.textContent = `
            :host { padding-top: 10px !important; text-align: right !important; }
                :host > button { position: relative; outline: none; user-select: none; margin-left: 10px; padding: 10px 20px; cursor: pointer; border: none; background-color: #fff; border-radius: 3px; }
                :host > button:hover { color: royalblue; background-color: #eee; }
                :host > button:focus { color: dodgerblue; }
                :host > button.disabled { pointer-events: none; opacity: 0.5; cursor: not-allowed; }
                :host > button.denied { background-color: #ffaaaa; }
                :host > button.waiting { color: rgba(255, 255, 255, 0); background-color: #eee; }
                :host > button.waiting::after { content: ""; position: absolute; width: 16px; height: 16px; top: 0; left: 0; right: 0; bottom: 0; margin: auto; border: 4px solid transparent; border-top-color: #ffffff; border-radius: 50%; animation: button-loading-spinner 1s ease infinite; }
                @keyframes button-loading-spinner {
                    from {
                        transform: rotate(0turn);
                    }
                    
                    to {
                        transform: rotate(1turn);
                    }
                }
        `;
        this.#list[key].shadowFooter.append(css);


        this.#list[key].btnResolve = document.createElement('button');
        this.#list[key].btnResolve.textContent = textResolve;
        this.#list[key].btnResolve.classList.add('disabled');


        Promise.all([script(this.#list[key].shadowMain)]).finally(() => this.#list[key].btnResolve.classList.remove('disabled'));


        let resolve = () => {

            this.#list[key].btnResolve.classList.add('waiting');

            Promise.all([callback(true, this.#list[key].shadowMain)]).then(e => {

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


        this.#list[key].shadowFooter.append(this.#list[key].btnResolve);


        setTimeout(() => this.#list[key].btnResolve.focus(), 1);


        return key;

    }

    confirm(content, callback = () => {}, {
        title = '',
        mainStyle = '',
        script = () => {},
        persistent = false,
        textResolve = 'Ok',
        textReject = 'No',
        onClose = () => {},
        onHelp
    } = {}) {

        if (typeof textReject != 'string' || !textReject.trim()) {

            throw new TypeError('Unsupported textReject');

        }


        let key = this.alert(content, callback, {
            title,
            mainStyle,
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

            Promise.all([callback(true, this.#list[key].shadowMain)]).then(e => {

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

            callback(false, this.#list[key].shadowMain);
            this.close(key);

        };


        this.#list[key].keyDown = e => {

            if (e.key == 'Escape' && !persistent) {

                callback(false, this.#list[key].shadowMain);
                this.close(key);

            } else if (/(Enter|\s)/i.test(e.key) && !persistent) {

                if (this.#list[key].shadowFooter.querySelector('button:focus') == this.#list[key].btnReject) {

                    callback(false, this.#list[key].shadowMain);
                    this.close(key);

                } else if (this.#list[key].shadowFooter.querySelector('button:focus') == this.#list[key].btnResolve) {

                    resolve();

                }

            }

        };


        this.#list[key].shadowFooter.prepend(this.#list[key].btnReject);

        return key;

    }

    notify(content, {
        title = '',
        footer = '',
        mainStyle = '',
        footerStyle = '',
        script = () => {},
        persistent = false,
        discreet = true,
        duration = 0,
        onClose = () => {},
        onHelp
    } = {}) {

        if (typeof duration != 'number') {

            throw new TypeError('Unsupported duration');

        }


        let key = this.show(content, {
            title,
            footer,
            mainStyle,
            footerStyle,
            script,
            persistent,
            onClose,
            onHelp
        });


        this.#list[key].duration = Math.max(3000, duration < 3000 ? (title +''+ content +''+ footer).replace(/(\s|<\/?[a-z-]+>)/ig, '').length * 150 : duration);


        this.#list[key].hide = setTimeout(() => this.#list[key].host.classList.add('hide'), this.#list[key].duration - 1000);
        this.#list[key].close = setTimeout(() => this.close(key), this.#list[key].duration);


        let css = document.createElement('style');
        css.textContent = `
            :host { pointer-events: none; background: transparent !important; backdrop-filter: none !important; }
                :host > aside { pointer-events: auto; text-align: center; animation: show 1s forwards; }
                ${discreet ? `
                    :host > aside { left: 100%; top: initial !important; bottom: 10px; transform: initial; }
                ` : ``}
                :host(.hide) aside { animation: hide 1s forwards; }

            ${discreet ? `
                @keyframes show { from { left: 100%; transform: translateX(0); } to { left: calc(100% - 10px); transform: translateX(-100%); } }
                @keyframes hide { from { left: calc(100% - 10px); transform: translateX(-100%); } to { left: 100%; transform: translateX(0); } }
            ` : `
                @keyframes show { from { top: 0; transform: translate(-50%, -100%); } to { top: 10px; transform: translate(-50%, 0); } }
                @keyframes hide { from { top: 10px; transform: translate(-50%, 0); } to { top: 0; transform: translate(-50%, -100%); } }
            `}
        `;
        this.#list[key].shadowRoot.append(css);


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
        mainStyle = '',
        footerStyle = '',
        script = () => {},
        persistent = false,
        fullScreen = false,
        onClose = () => {},
        onHelp
    } = {}) {

        let key = this.show(content, {
            title,
            footer,
            mainStyle,
            footerStyle,
            script,
            persistent,
            onClose,
            onHelp
        });


        let css = document.createElement('style');
        css.textContent = `
            ${fullScreen ? `
                :host > aside { padding: 0 !important; left: 0 !important; top: 0 !important; transform: none !important; width: 100% !important; max-width: initial !important; height: 100% !important; max-height: initial !important; border-radius: initial !important; }
                :host > aside > header { flex-direction: row-reverse !important; }
                :host > aside > header > button { transform: scaleX(-1); }
                :host > aside > header > button:hover { transform: scaleX(-1) scale(1.1) }
                :host > aside > footer > div { margin: 10px !important; }
            ` : `
                :host > aside > header > button:hover { transform: scale(1.1) }
            `}
            
            :host > aside > header > button { outline: none; user-select: none; width: 40px; height: 40px; cursor: pointer; text-align: center; font-size: 18px; font-weight: bold; background: transparent; border: none; display: inline-flex; justify-content: center; align-items: center; }
        `;
        this.#list[key].shadowRoot.append(css);


        this.#list[key].btnClose = document.createElement('button');
        this.#list[key].btnClose.textContent = fullScreen ? '➜' : '✕';
        this.#list[key].btnClose.onclick = () => {

            this.close(key);

        };


        this.#list[key].header.append(this.#list[key].btnClose);


        setTimeout(() => this.#list[key].btnClose.focus(), 1);


        return key;

    }

    close(key = null) {

        if (key == null) {

            let keys = Object.keys(this.#list);

            if (keys.length) {

                key = keys.at(-1);

            } else {

                throw new RangeError('Empty Stack');

            }

        } else {

            if (!(key in this.#list)) {

                throw new ReferenceError('Not Found');

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

        if ('hide' in this.#list[key]) {

            clearTimeout(this.#list[key].hide);

        }

        if ('close' in this.#list[key]) {

            clearTimeout(this.#list[key].close);

        }


        this.#list[key].host.onclick = null;
        this.#list[key].shadowRoot = null;
        this.#list[key].shadowMain = null;
        this.#list[key].shadowFooter = null;
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


        delete this.#list[key];


        let keys = Object.keys(this.#list);
        if (keys.length) {

            let lastKey = keys.at(-1);

            if ( 'duration' in this.#list[lastKey] && !this.#list[lastKey].hide && !this.#list[lastKey].close) {

                // unfreeze the most recent notification
                this.#list[lastKey].hide = setTimeout(() => this.#list[lastKey].host.classList.add('hide'), this.#list[lastKey].duration - 1000);
                this.#list[lastKey].close = setTimeout(() => this.close(lastKey), this.#list[lastKey].duration);

            } else if (this.#list[lastKey].btnResolve) {

                this.#list[lastKey].btnResolve.focus();

            } else if (this.#list[lastKey].btnClose) {

                this.#list[lastKey].btnClose.focus();

            }

        }


        return key;

    }

}