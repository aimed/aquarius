declare module 'mermaid' {
    type InitializeConfig = {
        startOnLoad: boolean;
    };
    
    type DiagramLoadHandler = (html: string) => void;
    type MermaidAPI = {
        initialize: (config: InitializeConfig) => void;
        render: (name: string | null | undefined, data: string, handler: DiagramLoadHandler, html?: HTMLElement | null) => void;
        parse: (text: string) => any;
    }

    let mermaidAPI: MermaidAPI;
    
    export {
        mermaidAPI
    };
}