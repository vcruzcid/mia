import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ANIMATION_SPECIALIZATIONS } from '@/types';

interface SpecializationsGridProps {
  selected: string[];
  onChange: (updated: string[]) => void;
  error?: string;
}

export function SpecializationsGrid({ selected, onChange, error }: SpecializationsGridProps) {
  const handleToggle = (spec: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, spec]);
    } else {
      onChange(selected.filter((s) => s !== spec));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300">Especialidades</Label>
        <span className="text-xs text-gray-500">{selected.length}/10 seleccionadas</span>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-900 rounded-md border border-gray-700 max-h-64 overflow-y-auto">
        {ANIMATION_SPECIALIZATIONS.map((spec) => {
          const isChecked = selected.includes(spec);
          const isDisabled = !isChecked && selected.length >= 10;
          return (
            <div key={spec} className="flex items-center gap-2">
              <Checkbox
                id={`spec-${spec}`}
                checked={isChecked}
                disabled={isDisabled}
                onCheckedChange={(checked) => handleToggle(spec, checked === true)}
                className="border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <label
                htmlFor={`spec-${spec}`}
                className={`text-xs cursor-pointer select-none ${
                  isDisabled ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                {spec}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
