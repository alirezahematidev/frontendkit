export interface KitInputProps {
  name: string;
}

export const KitInput = (props: KitInputProps) => {
  return <div>{props.name}</div>;
};
