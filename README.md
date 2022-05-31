# Dialog.js
Get all the main dialog boxes dynamically and responsively


## Which is?
It is a responsive and cross-browser dialog system that facilitates the creation of modals that define a new section of independent content on a page.


## Interfaces
```javascript
// Constructor
Dialog(
    shadowRootMode?: ('open' | 'closed') = 'open', // A string specifying the encapsulation mode for the shadow DOM tree
    delegatesFocus?: boolean = false, // When a non-focusable part of the shadow DOM is clicked, the first focusable part is given focus
)
```

```javascript
// Getters
list(): string[] // List reverted of created dialog ID's

shadowRootMode(): 'open' | 'closed'

delegatesFocus(): boolean
```

```javascript
// Setters
shadowRootMode(arg?: ('open' | 'closed') = 'open'): void

delegatesFocus(arg?: boolean = false): viod
```

```javascript
// Methods
alert(
    content: string | HTMLElement,
    callback: (flag: boolean, main: HTMLElement) => boolean | Promise<any> | void,
    {
        title = '',
        mainStyle = '',
        script = () => {},
        persistent = false, // If true, the dialog does not close on the click outside or on the press of the Escape, Enter and Space
        textResolve = 'Ok',
        onClose = () => {},
        onHelp = undefined // If set, a button will be exposed in the dialog and the click event will trigger the callback
    }: {
        title?: string,
        mainStyle?: string,
        script?: (main: HTMLElement) => Promise<any> | void,
        persistent?: boolean,
        textResolve?: string,
        onClose?: (key: string) => void,
        onHelp?: (event: MouseEvent) => void | undefined
    } = {}
): string

close(key?: (string | null) = null): boolean | null // If a key is not inserted, the most recent dialog will be removed from the stacks

confirm(
    content: string | HTMLElement,
    callback: (flag: boolean, main: HTMLElement) => boolean | Promise<any> | void,
    {
        title = '',
        mainStyle = '',
        script = () => {},
        persistent = false, // If true, the dialog does not close on the click outside or on the press of the Escape, Enter and Space
        textResolve = 'Ok',
        textReject = 'No',
        onClose = () => {},
        onHelp = undefined // If set, a button will be exposed in the dialog and the click event will trigger the callback
    }: {
        title?: string,
        mainStyle?: string,
        script?: (main: HTMLElement) => Promise<any> | void,
        persistent?: boolean,
        textResolve?: string,
        textReject?: string,
        onClose?: (key: string) => void,
        onHelp?: (event: MouseEvent) => void | undefined
    } = {}
): string

notify(
    content: string | HTMLElement,
    {
        title = '',
        footer = '',
        mainStyle = '',
        footerStyle = '',
        script = () => {},
        persistent = false, // If true, the dialog does not close on the press of the Escape
        discreet = true, // If true, the dialog will appear in the lower right corner, otherwise, in the upper central part
        duration = null, // If a time is not provided, it will be calculated based on the total number of characters, although the minimum time is 3000ms
        onClose = () => {},
        onHelp = undefined // If set, a button will be exposed in the dialog and the click event will trigger the callback
    }: {
        title?: string,
        footer?: string,
        mainStyle?: string,
        footerStyle?: string,
        script?: (main: HTMLElement, footer: HTMLElement) => void,
        persistent?: boolean,
        discreet?: boolean,
        duration?: number,
        onClose?: (key: string) => void,
        onHelp?: (event: MouseEvent) => void | undefined
    } = {}
): string

popUp(
    content: string | HTMLElement,
    {
        title = '',
        footer = '',
        mainStyle = '',
        footerStyle = '',
        script = () => {},
        persistent = false, // If true, the dialog does not close on the click outside or on the press of the Escape
        fullScreen = false, // If true, the dialog will fill the entire window and the close button will change
        onClose = () => {},
        onHelp = undefined // If set, a button will be exposed in the dialog and the click event will trigger the callback
    }: {
        title?: string,
        footer?: string,
        mainStyle?: string,
        footerStyle?: string,
        script?: (main: HTMLElement, footer: HTMLElement) => void,
        persistent?: boolean,
        fullScreen?: boolean,
        onClose?: (key: string) => void,
        onHelp?: (event: MouseEvent) => void | undefined
    } = {}
): string

show(
    content: string | HTMLElement,
    {
        title = '',
        footer = '',
        mainStyle = '',
        footerStyle = '',
        script = () => {},
        persistent = false, // If true, the dialog does not close on the click outside or on the press of the Escape
        fullScreen = false, // If true, the dialog will fill the entire window
        onClose = () => {},
        onHelp = undefined // If set, a button will be exposed in the dialog and the click event will trigger the callback
    }: {
        title?: string,
        footer?: string,
        mainStyle?: string,
        footerStyle?: string,
        script?: (main: HTMLElement, footer: HTMLElement) => void,
        persistent?: boolean,
        fullScreen?: boolean,
        onClose?: (key: string) => void,
        onHelp?: (event: MouseEvent) => void | undefined
    } = {}
): string
```

## QuickStart
[![Edit Dialog.js](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/dialog-js-ewfgew?autoresize=1&expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)

> Every method returns the key for the modal created\
> If the close method returns null, then the dialog was not found
