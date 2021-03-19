import { RouteComponentProps } from "react-router-dom";
import { History, Location } from "history";
import { View } from "../features/home/reducer";
import { ItemKind } from "../api/metadata/MetadataProviderInterface";

interface MatchParams {
  itemId: string;
  itemKind: ItemKind;
  view: View;
}

export interface RouterProps extends RouteComponentProps<MatchParams> {
  history: History;
  location: Location;
}
