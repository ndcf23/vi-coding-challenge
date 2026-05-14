import { html } from "lit";
import "./my-element";

// write default storybook story
export default {
  title: "MyElement",
  component: "my-element",
  args: {
    count: 0,
    docsHint: "Click on the Vite and Lit logos to learn more",
  },
  argTypes: {
    count: { control: "number" },
    docsHint: { control: "text" },
  },
};

export const Default = (args: { count: number; docsHint: string; }) => html`
	<my-element .count=${args.count} .docsHint=${args.docsHint}></my-element>
`;
