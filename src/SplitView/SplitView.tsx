import * as React from 'react';

export interface SplitViewState { }
export interface SplitViewProps {
    left: JSX.Element;
    right: JSX.Element;
    containerStyle?: React.CSSProperties;
}

export class SplitView extends React.Component<SplitViewProps, SplitViewState> {
    render() {
        const { left, right, containerStyle } = this.props;

        const outerStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'row',
            ...containerStyle
        };

        return (
            <section style={outerStyle}>
                {left}
                {right}
            </section>
        );
    }
}
