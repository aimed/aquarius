import * as React from 'react';

export interface ButtonState { }
export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> { }

export class Button extends React.Component<ButtonProps, ButtonState> {
    render() {
        const { style, ...props } = this.props;
        const buttonsStyle: React.CSSProperties = {
            // border: 'none',
            // background: '#02AFF5'
        };

        return (
            <button style={buttonsStyle} {...props} />
        );
    }
}
