import { html } from "lit";
import "./product-overview";

// write default storybook story
export default {
  title: "ProductOverview",
  component: "product-overview",
  args: {
    headline: "List of Our Pocket Monsters",
    numberOfItems: 150,
  },
  argTypes: {
    headline: { control: "text" },
    numberOfItems: { control: "number" },
  },
};

export const Default = (args: {
  headline: string;
  numberOfItems: number;
}) => html`
  <product-overview
    .headline=${args.headline}
    .numberOfItems=${args.numberOfItems}
  ></product-overview>
`;
