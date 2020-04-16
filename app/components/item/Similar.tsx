import React, { Component } from "react";
import CardsGrid from "../card/CardsGrid";
import Butter from "../../api/Butter";

type Props = {
  itemId: string;
  type: string;
};

type State = {
  items: Array<Record<string, any>>;
  isLoading: boolean;
  hasFetched: boolean;
};

export default class Similar extends Component<Props, State> {
  props: Props;

  state: State;

  butter: Butter;

  initialState: State = {
    items: [],
    isLoading: false,
    hasFetched: false,
  };

  constructor(props: Props) {
    super(props);

    this.butter = new Butter();
    this.state = this.initialState;
  }

  componentDidMount() {
    const { itemId } = this.props;
    this.getSimilar(itemId);
  }

  async getSimilar(imdbId: string) {
    const { type } = this.props;
    this.setState({ isLoading: true });

    try {
      const similarItems = await this.butter.getSimilar(type, imdbId);

      this.setState({
        similarItems,
        isLoading: false,
        isFinished: true,
      });
    } catch (error) {
      console.log(error);
    }

    return [];
  }

  render() {
    const { isLoading, isFinished, similarItems } = this.state;

    return (
      <CardsGrid
        title="similar"
        limit={4}
        items={similarItems}
        metadataLoading={isLoading}
        isFinished={isFinished}
        autofit
      />
    );
  }
}
