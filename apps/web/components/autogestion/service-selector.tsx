'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, DollarSign, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatDuration, formatPrice } from '@/lib/utils';
import type { Service, Employee, VariationGroup, VariationOption } from '@/lib/api';

interface SelectedVariation {
  groupId: string;
  options: VariationOption[];
}

export interface ServiceSelection {
  service: Service;
  employee?: Employee;
  variations: SelectedVariation[];
  totalPrice: number;
  totalDuration: number;
  variationNotes: string;
}

interface ServiceSelectorProps {
  services: Service[];
  employees: Employee[];
  onSelect: (selection: ServiceSelection | null) => void;
  selected: ServiceSelection | null;
}

export function ServiceSelector({ services, employees, onSelect, selected }: ServiceSelectorProps) {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, SelectedVariation>>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // When service changes, reset variations
  useEffect(() => {
    if (expandedServiceId) {
      setSelectedVariations({});
    }
  }, [expandedServiceId]);

  const handleServiceClick = (service: Service) => {
    if (service.variations && service.variations.length > 0) {
      setExpandedServiceId(expandedServiceId === service.id ? null : service.id);
    } else {
      // No variations, select directly
      const sel: ServiceSelection = {
        service,
        employee: selectedEmployeeId ? employees.find((e) => e.id === selectedEmployeeId) : undefined,
        variations: [],
        totalPrice: service.price,
        totalDuration: service.duration,
        variationNotes: '',
      };
      onSelect(sel);
    }
  };

  const handleVariationToggle = (service: Service, group: VariationGroup, option: VariationOption) => {
    setSelectedVariations((prev) => {
      const current = prev[group.id];

      let newOptions: VariationOption[];
      if (group.type === 'single') {
        newOptions = current?.options[0]?.id === option.id ? [] : [option];
      } else {
        const existing = current?.options || [];
        const isSelected = existing.some((o) => o.id === option.id);
        newOptions = isSelected ? existing.filter((o) => o.id !== option.id) : [...existing, option];
      }

      const newVariations = { ...prev };
      if (newOptions.length === 0) {
        delete newVariations[group.id];
      } else {
        newVariations[group.id] = { groupId: group.id, options: newOptions };
      }

      return newVariations;
    });
  };

  const confirmVariationSelection = (service: Service) => {
    const variationsList = Object.values(selectedVariations);

    // Check required groups
    const requiredGroups = service.variations?.filter((g) => g.required) || [];
    const allRequiredFilled = requiredGroups.every(
      (g) => selectedVariations[g.id]?.options.length > 0
    );

    if (!allRequiredFilled) return;

    let totalPrice = service.price;
    let totalDuration = service.duration;
    const notes: string[] = [];

    variationsList.forEach((v) => {
      v.options.forEach((opt) => {
        if (opt.pricingType === 'absolute') {
          totalPrice = opt.priceModifier;
        } else {
          totalPrice += opt.priceModifier;
        }
        totalDuration += opt.durationModifier;
        notes.push(opt.name);
      });
    });

    const sel: ServiceSelection = {
      service,
      employee: selectedEmployeeId ? employees.find((e) => e.id === selectedEmployeeId) : undefined,
      variations: variationsList,
      totalPrice,
      totalDuration,
      variationNotes: notes.join(', '),
    };
    onSelect(sel);
  };

  if (selected) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Servicio seleccionado</Label>
        <div className="p-3 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm">{selected.service.name}</p>
            <button
              onClick={() => {
                onSelect(null);
                setExpandedServiceId(null);
                setSelectedVariations({});
              }}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              Cambiar
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatPrice(selected.totalPrice)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(selected.totalDuration)}
            </span>
          </div>
          {selected.variationNotes && (
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">{selected.variationNotes}</p>
          )}
          {selected.employee && (
            <p className="text-xs text-muted-foreground mt-1">Con: {selected.employee.name}</p>
          )}
        </div>

        {/* Employee selector (changeable even after service is selected) */}
        {employees.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Empleado (opcional)</Label>
            <select
              value={selected.employee?.id || ''}
              onChange={(e) => {
                const emp = e.target.value ? employees.find((em) => em.id === e.target.value) : undefined;
                onSelect({ ...selected, employee: emp });
              }}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm"
            >
              <option value="">Sin asignar</option>
              {employees.filter((e) => e.isActive).map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Elegir servicio</Label>

      {/* Employee selector */}
      {employees.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Empleado (opcional)</Label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
          >
            <option value="">Sin asignar</option>
            {employees.filter((e) => e.isActive).map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Services list */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {services.filter((s) => s.isActive).map((service) => {
          const hasVariations = service.variations && service.variations.length > 0;
          const isExpanded = expandedServiceId === service.id;

          return (
            <div key={service.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => handleServiceClick(service)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 text-left transition-colors',
                  isExpanded
                    ? 'bg-violet-50 dark:bg-violet-900/30'
                    : 'hover:bg-muted'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{service.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formatPrice(service.price)}</span>
                    <span>·</span>
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                </div>
                {hasVariations ? (
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                )}
              </button>

              {/* Expanded variations */}
              {isExpanded && hasVariations && (
                <div className="border-t p-3 space-y-3 bg-slate-50 dark:bg-neutral-800/50">
                  {service.variations!.map((group) => (
                    <div key={group.id} className="space-y-1.5">
                      <p className="text-xs font-medium">
                        {group.label}
                        {group.required && <span className="text-red-500 ml-1">*</span>}
                        <span className="text-muted-foreground font-normal ml-1">
                          ({group.type === 'single' ? 'elegir uno' : 'elegir varios'})
                        </span>
                      </p>
                      <div className="space-y-1">
                        {group.options.map((option) => {
                          const isOptionSelected = selectedVariations[group.id]?.options.some(
                            (o) => o.id === option.id
                          );
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleVariationToggle(service, group, option)}
                              className={cn(
                                'w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors text-left',
                                isOptionSelected
                                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                                  : 'hover:bg-muted'
                              )}
                            >
                              <div className={cn(
                                'h-4 w-4 rounded shrink-0 border-2 flex items-center justify-center',
                                group.type === 'single' ? 'rounded-full' : 'rounded',
                                isOptionSelected
                                  ? 'border-violet-500 bg-violet-500'
                                  : 'border-muted-foreground/30'
                              )}>
                                {isOptionSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="flex-1">{option.name}</span>
                              {option.priceModifier !== 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {option.pricingType === 'absolute'
                                    ? formatPrice(option.priceModifier)
                                    : `${option.priceModifier > 0 ? '+' : ''}${formatPrice(option.priceModifier)}`}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Price summary */}
                  {(() => {
                    const allVariations = Object.values(selectedVariations);
                    let price = service.price;
                    let duration = service.duration;
                    allVariations.forEach((v) =>
                      v.options.forEach((o) => {
                        if (o.pricingType === 'absolute') price = o.priceModifier;
                        else price += o.priceModifier;
                        duration += o.durationModifier;
                      })
                    );

                    const requiredGroups = service.variations!.filter((g) => g.required);
                    const allFilled = requiredGroups.every(
                      (g) => selectedVariations[g.id]?.options.length > 0
                    );

                    return (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm">
                          <span className="font-semibold">{formatPrice(price)}</span>
                          <span className="text-muted-foreground ml-2">{formatDuration(duration)}</span>
                        </div>
                        <button
                          onClick={() => confirmVariationSelection(service)}
                          disabled={!allFilled}
                          className={cn(
                            'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                            allFilled
                              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          )}
                        >
                          Seleccionar
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
