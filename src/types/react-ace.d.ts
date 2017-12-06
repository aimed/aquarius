declare module 'react-ace' {
    interface AceEditorProps {
        mode?: string;
        theme?: string;
        onChange?: (value: string) => void;
        name?: string;
        editorProps?: any;
        value?: string;
        enableLiveAutocompletion?: boolean;
        enableBasicAutocompletion?: boolean;
        className?: string;
        style?: React.CSSProperties;
        width?: string;
        height?: string;
    }
    export default class AceEditor extends React.Component<AceEditorProps, {}> {}
}