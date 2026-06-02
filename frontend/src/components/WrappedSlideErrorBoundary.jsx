import React from "react";

export default class WrappedSlideErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("[wrapped] Slide render failed:", error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-[18rem] px-4 text-center">
          <p className="m-0 text-[0.88rem] font-semibold text-[var(--slide-fg,#fff)]">
            This slide couldn&apos;t load.
          </p>
          <p className="mt-2 m-0 text-[0.78rem] leading-snug text-[var(--slide-fg-muted,rgb(255_255_255/0.75))]">
            Tap the sides to continue, or swipe down to exit.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
