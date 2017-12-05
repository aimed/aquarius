import * as React from 'react';

export interface MermaidInputState { }
export interface MermaidInputProps extends React.HTMLProps<HTMLTextAreaElement> { }

export class MermaidInput extends React.Component<MermaidInputProps, MermaidInputState> {

    handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.keyCode === 9 /* Tab */) {
            event.preventDefault();
        }
    }

    render() {
        const { style: userStyle, ...props } = this.props;

        const style: React.CSSProperties = {
            fontFamily: 'monospace',
            outline: 'none',
            border: 'none',
            borderRight: 'solid 1px #f9f9f9',
            fontSize: '1.2rem',
            whiteSpace: 'pre',
            ...userStyle
        };

        return (
            <textarea style={style} onKeyUp={this.handleKeyUp} {...props} />
        );
    }
}
