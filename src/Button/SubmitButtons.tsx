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

    timeOut: NodeJS.Timer | null = null;

    componentWillUnmount() {
        this.clearTimeout();
    }

    handleClick = () => {
        this.clearTimeout();
        const { onClick, onSuccess = () => {/**/}, onFailure = () => {/**/} } = this.props;

        if (!onClick) {
            return;
        }

        const clickData = onClick();

        if (clickData) {
            this.setState({ submitting: true, submitSuccess: undefined });
            clickData.then(r => {
                this.setState({ submitting: false, submitSuccess: true });
                this.timeOut = setTimeout(() => {
                    this.setState({ submitSuccess: undefined });
                    this.timeOut = null;
                }, 500);
                onSuccess(r as any);
            }).catch(e => {
                this.setState({ submitting: false });
                onFailure(e);
            });
        }
    }

    private clearTimeout() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
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
