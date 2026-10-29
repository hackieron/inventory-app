import { View } from 'react-native';
import FormSection from './FormSection';
import FormField from './FormField';
import DatePickerField from './DatePickerField';
import LocationMapPicker from './LocationMapPicker';
import type { CreateItemValues } from '../types';

export default function CreateItemForm({ values, setField }: {
  values: CreateItemValues;
  setField: <K extends keyof CreateItemValues>(key: K, value: CreateItemValues[K]) => void;
}) {
  return <>
    <FormSection title="Basic details" subtitle="Let's start with the essentials" icon="information-circle-outline">
      <FormField label="Item name" icon="cube-outline" placeholder="e.g. MacBook Pro" required value={values.name} onChangeText={(v) => setField('name', v)} />
      <FormField label="Serial number" icon="barcode-outline" placeholder="e.g. SN-123456789" autoCapitalize="characters" hint="Useful for identifying your belongings." value={values.serialNumber} onChangeText={(v) => setField('serialNumber', v)} />
      <DatePickerField value={values.purchaseDate} onChange={(v) => setField('purchaseDate', v)} />
    </FormSection>
    <LocationMapPicker
      value={values.coordinates}
      address={values.address}
      onChange={(coordinates) =>
        setField('coordinates', coordinates)
      }
      onAddressChange={(address) =>
        setField('address', address)
      }
    />
    <FormField
      label="Map address"
      icon="navigate-outline"
      placeholder="Select a location or enter an address"
      value={values.address}
      onChangeText={(value) => setField('address', value)}
    />
    <FormSection title="Additional information" subtitle="Add more context about your item" icon="document-text-outline">
      <FormField label="Description" icon="reader-outline" placeholder="Tell us more about this item..." multiline value={values.description} onChangeText={(v) => setField('description', v)} />
      <FormField label="Personal notes" icon="create-outline" placeholder="Any reminders or extra details..." multiline value={values.notes} onChangeText={(v) => setField('notes', v)} />
    </FormSection>
  </>;
}
