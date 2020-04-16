import React, { Component } from "react";
import { Alert } from "reactstrap";

type State = {
  online: boolean;
};

export default class OfflineAlert extends Component<{}, State> {
  state: State = {
    online: true,
  };

  onlineCheckInterval?: NodeJS.Timeout;

  ONLINE_INTERVAL = 3000;

  componentDidMount() {
    this.setState({
      online: navigator.onLine,
    });
    this.onlineCheckInterval = setInterval(() => {
      this.setState({
        online: navigator.onLine,
      });
    }, this.ONLINE_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.onlineCheckInterval);
  }

  render() {
    const { online } = this.state;
    return online ? null : <Alert color="warning">You are offline</Alert>;
  }
}
