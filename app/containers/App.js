// @flow
/* eslint react/prefer-stateless-function: off */
import React, { Component, typeof Children } from "react";

type Props = {
  children: Children,
};

export default class App extends Component<Props, {}> {
  props: Props;

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}
