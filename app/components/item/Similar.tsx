import React, { Component } from "react";
import CardsGrid from "../card/CardsGrid";
import Butter from "../../api/Butter";
import { Item, ItemKind } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  itemId: string;
  type: ItemKind;
};

type State = {
  isLoading: boolean;
  isFinished: boolean;
  items: Item[];
};

export default class Similar extends Component<Props, State> {
  state: State = {
    items: [],
    isLoading: false,
    isFinished: false,
  };

  butter: Butter = new Butter();

  componentDidMount() {
    const { itemId } = this.props;
    this.getSimilar(itemId);
  }

  async getSimilar(imdbId: string) {
    const { type } = this.props;
    this.setState({ isLoading: true });

    try {
      const items = await this.butter.getSimilar(type, imdbId);

      this.setState({
        items,
        isLoading: false,
        isFinished: true,
      });
    } catch (error) {
      console.log(error);
    }

    return [];
  }

  render() {
    const { isLoading, isFinished, items } = this.state;

    return (
      <CardsGrid
        title="similar"
        limit={4}
        items={items}
        isLoading={isLoading}
        isFinished={isFinished}
        autofit
      />
    );
  }
}
