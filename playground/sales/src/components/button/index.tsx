export interface KitButtonProps {
  name: string;
}

export const KitButton = (props: KitButtonProps) => {
  return <div>{props.name}</div>;
};
