declare module 'react-ace' {
    interface Marker {
        startRow: number;
        endRow: number;
        startCol: number;
        endCol: number;
        className: string;
        type: string;
    }

    interface Annotation { 
        row: number;
        column: number; 
        type: 'error';
        text: string;
    }

    interface AceEditorProps {
        mode?: string;
        theme?: string;
        onChange?: (value: string) => void;
        name?: string;
        editorProps?: any;
        value?: string;
        enableSnippets?: boolean;
        enableLiveAutocompletion?: boolean;
        enableBasicAutocompletion?: boolean;
        className?: string;
        style?: React.CSSProperties;
        width?: string;
        height?: string;
        debounceChangePeriod?: number | null;
        markers?: Marker[];
        annotations?: Annotation[];
    }
    
    export default class AceEditor extends React.Component<AceEditorProps, {}> {}
}