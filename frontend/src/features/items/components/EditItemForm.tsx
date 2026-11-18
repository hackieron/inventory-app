import CreateItemForm from './CreateItemForm';
import type { CreateItemValues } from '../types';

export default function EditItemForm({ values, setField }: {
  values: CreateItemValues;
  setField: <K extends keyof CreateItemValues>(key: K, value: CreateItemValues[K]) => void;
}) {
  return <CreateItemForm values={values} setField={setField} />;
}
