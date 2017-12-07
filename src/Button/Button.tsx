import * as React from 'react';

export interface ButtonState { }
export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> { }

export class Button extends React.Component<ButtonProps, ButtonState> {
    render() {
        const { className, ...props } = this.props;
        return (
            <button className={'button ' + className} {...props} />
        );
    }
}
