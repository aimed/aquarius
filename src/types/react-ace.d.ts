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
        
    }
    export default class AceEditor extends React.Component<AceEditorProps, {}> {}
}