import * as React from 'react';

export interface ButtonState { }
export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> { }

export class Button extends React.Component<ButtonProps, ButtonState> {
    render() {
        const { style, className, ...props } = this.props;

        const buttonsStyle: React.CSSProperties = {
            ...style
        };

        return (
            <button style={buttonsStyle} className={'button ' + className} {...props} />
        );
    }
}
