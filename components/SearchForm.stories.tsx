import SearchForm from "./SearchForm";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SearchForm> = {
  title: "Search/SearchForm",
  component: SearchForm,
};

export default meta;

type Story = StoryObj<typeof SearchForm>;

export const Default: Story = {
  render: () => <SearchForm />,
};
