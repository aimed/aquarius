declare module 'mermaid' {
    type InitializeConfig = {
        startOnLoad?: boolean;
        theme?: 'dark'|'default'|'forest'|'neutral';
    };
    
    type DiagramLoadHandler = (html: string) => void;
    let initialize: (config: InitializeConfig) => void;
    let render: (name: string | null | undefined, data: string, handler: DiagramLoadHandler, html?: HTMLElement | null) => void;
    let parse: (text: string) => boolean;

    export {
        initialize,
        render,
        parse
    };
}