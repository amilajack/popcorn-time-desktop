/* eslint-disable */
// @ts-ignore
import React, { Component } from "react";
import { withToastManager } from "react-toast-notifications";

type State = {
  isOnline: boolean;
};

class ConnectivityListener extends Component<{}, State> {
  offlineToastId?: string;

  state: State = { isOnline: window ? window.navigator.onLine : false };

  // NOTE: add/remove event listeners omitted for brevity

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { isOnline } = this.state;

    if (prevState.isOnline !== isOnline) {
      return { isOnline };
    }

    return null;
  }

  componentDidUpdate(props, state, snapshot) {
    if (!snapshot) return;

    const { toastManager } = props;
    const { isOnline } = snapshot;

    const content = (
      <div>
        <strong>{isOnline ? "Online" : "Offline"}</strong>
        <div>
          {isOnline
            ? "Editing is available again"
            : "Changes you make may not be saved"}
        </div>
      </div>
    );

    const callback = isOnline ? this.onlineCallback : this.offlineCallback;

    toastManager.add(
      content,
      {
        appearance: "info",
        autoDismiss: isOnline,
      },
      callback
    );
  }

  offlineCallback = (id: string) => {
    this.offlineToastId = id;
  };

  onlineCallback = () => {
    const { toastManager } = this.props;
    toastManager.remove(this.offlineToastId);
    this.offlineToastId = undefined;
  };

  render() {
    return null;
  }
}

export default withToastManager(ConnectivityListener);
