import * as React from 'react';

export interface SubmitButtonState {
    submitting?: boolean;
    submitSuccess?: boolean;
}

export interface SubmitButtonProps<T> extends React.HTMLProps<HTMLButtonElement> {
    onSuccess?: (response?: T) => void;
    onFailure?: (error?: any) => void;
    onClick?: () => Promise<T | void> | undefined;
}

export class SubmitButton<T> extends React.Component<SubmitButtonProps<T>, SubmitButtonState> {
    state: SubmitButtonState = {
        submitting: false
    };

    handleClick = () => {
        const { onClick, onSuccess = () => {/**/}, onFailure = () => {/**/} } = this.props;

        if (!onClick) {
            return;
        }

        const clickData = onClick();

        if (clickData) {
            this.setState({ submitting: true });
            clickData.then(r => {
                this.setState({ submitting: false, submitSuccess: true });
                setTimeout(() => {
                    this.setState({ submitSuccess: undefined });
                }, 500);
                onSuccess(r as any);
            }).catch(e => {
                this.setState({ submitting: false });
                onFailure(e);
            });
        }
    }

    render() {
        const { submitting, submitSuccess } = this.state;
        const { className, disabled = !submitting, onClick, ...props } = this.props;

        const classNames = [
            'button',
            className,
            submitting && 'button--submitting',
            submitSuccess && 'button--submit-success'
        ].filter(c => !!c).join(' ');

        return (
            <button
                className={classNames}
                onClick={this.handleClick}
                disabled={submitting}
                {...props}
            />
        );
    }
}
