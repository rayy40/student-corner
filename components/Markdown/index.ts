import { CodeBlock } from "./codeblock";
import { ListItem, OrderedList, UnorderedList } from "./list";
import { Paragraph } from "./paragraph";
import { PreBlock } from "./pre-block";
import { Table } from "./table";
import {
  PrimaryHeader,
  SecondaryHeader,
  Strong,
  TertiaryHeader,
  Header,
} from "./tags";

const overriddenComponents = {
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  strong: Strong,
  h1: PrimaryHeader,
  h2: SecondaryHeader,
  h3: TertiaryHeader,
  h4: Header,
  h5: Header,
  h6: Header,
  pre: PreBlock,
  table: Table,
};

export default overriddenComponents;
