import CreateItemForm from './CreateItemForm';
import type { CreateItemValues } from '../types';

export default function EditItemForm({ values, setField, imageUri }: {
  values: CreateItemValues;
  setField: <K extends keyof CreateItemValues>(key: K, value: CreateItemValues[K]) => void;
  imageUri?: string | null;
}) {
  return <CreateItemForm values={values} setField={setField} imageUri={imageUri} />;
}
