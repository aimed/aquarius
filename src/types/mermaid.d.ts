declare module 'mermaid' {
    export type Theme = 'dark'|'default'|'forest'|'neutral';
    
    type InitializeConfig = {
        startOnLoad?: boolean;
        theme?: Theme;
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