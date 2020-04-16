/* eslint react/prefer-stateless-function: off */
import React, { Component, ReactNode } from "react";
import { Container } from "reactstrap";

type Props = {
  children: ReactNode;
};

export default class App extends Component<Props, {}> {
  render() {
    const { children } = this.props;
    return <Container fluid>{children}</Container>;
  }
}
