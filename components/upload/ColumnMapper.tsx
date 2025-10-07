'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VALID_SCHEMA_FIELDS } from '@/lib/queries/mappings';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';

export interface ColumnMappingData {
  excel_column: string;
  schema_field: string;
  data_type?: string;
  transform_rule?: string;
}

interface ColumnMapperProps {
  excelColumns: string[];
  initialMappings?: ColumnMappingData[];
  onMappingsChange?: (mappings: ColumnMappingData[]) => void;
  onSave?: (mappings: ColumnMappingData[]) => Promise<void>;
}

/**
 * Suggests a schema field based on Excel column name
 */
function suggestSchemaField(excelColumn: string): string {
  const normalized = excelColumn.toLowerCase().replace(/[^a-z0-9]/g, '');

  const suggestions: Record<string, string> = {
    claimno: 'claim_number',
    claimnumber: 'claim_number',
    memberid: 'member_number',
    memberno: 'member_number',
    membernumber: 'member_number',
    patient: 'patient_name',
    patientname: 'patient_name',
    provider: 'provider_name',
    providername: 'provider_name',
    hospital: 'provider_name',
    payer: 'payer_name',
    payername: 'payer_name',
    insurer: 'payer_name',
    insurance: 'payer_name',
    scheme: 'scheme_name',
    schemename: 'scheme_name',
    plan: 'scheme_name',
    servicedate: 'service_date',
    dateofservice: 'service_date',
    claimdate: 'claim_date',
    dateofclaim: 'claim_date',
    invoice: 'invoice_amount_cents',
    invoiceamount: 'invoice_amount_cents',
    invoiced: 'invoice_amount_cents',
    approved: 'approved_amount_cents',
    approvedamount: 'approved_amount_cents',
    status: 'status',
    claimstatus: 'status',
    diagnosis: 'diagnosis_code',
    diagnosiscode: 'diagnosis_code',
    icd10: 'diagnosis_code',
    procedure: 'procedure_code',
    procedurecode: 'procedure_code',
    cpt: 'procedure_code',
  };

  return suggestions[normalized] || '';
}

export function ColumnMapper({
  excelColumns,
  initialMappings = [],
  onMappingsChange,
  onSave,
}: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMappingData[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize mappings
  useEffect(() => {
    if (initialMappings.length > 0) {
      setMappings(initialMappings);
    } else {
      // Auto-suggest mappings based on column names
      const suggested = excelColumns.map((col) => ({
        excel_column: col,
        schema_field: suggestSchemaField(col),
        data_type: undefined,
        transform_rule: undefined,
      }));
      setMappings(suggested);
    }
  }, [excelColumns, initialMappings]);

  // Notify parent when mappings change
  useEffect(() => {
    if (onMappingsChange) {
      onMappingsChange(mappings);
    }
  }, [mappings, onMappingsChange]);

  const handleSchemaFieldChange = (index: number, schemaField: string) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      schema_field: schemaField,
    };
    setMappings(newMappings);
    validateMappings(newMappings);
  };

  const validateMappings = (currentMappings: ColumnMappingData[]) => {
    const validationErrors: string[] = [];
    const schemaFieldsSeen = new Set<string>();

    currentMappings.forEach((mapping, index) => {
      if (!mapping.schema_field) {
        return; // Skip empty mappings
      }

      // Check for duplicates
      if (schemaFieldsSeen.has(mapping.schema_field)) {
        validationErrors.push(
          `Duplicate mapping: "${mapping.schema_field}" is mapped multiple times`
        );
      }
      schemaFieldsSeen.add(mapping.schema_field);
    });

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSave = async () => {
    // Filter out unmapped columns
    const completeMappings = mappings.filter((m) => m.schema_field);

    if (!validateMappings(completeMappings)) {
      return;
    }

    if (onSave) {
      setSaving(true);
      try {
        await onSave(completeMappings);
      } catch (error) {
        console.error('Error saving mappings:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const getMappedCount = () => {
    return mappings.filter((m) => m.schema_field).length;
  };

  const getAvailableSchemaFields = (currentField?: string): string[] => {
    const mapped = new Set(
      mappings
        .map((m) => m.schema_field)
        .filter((f) => f && f !== currentField)
    );
    return VALID_SCHEMA_FIELDS.filter(
      (field) => !mapped.has(field) || field === currentField
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Column Mapping</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Map Excel columns to database schema fields
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {getMappedCount()} of {excelColumns.length} mapped
          </Badge>
          <Button onClick={handleSave} disabled={saving || errors.length > 0}>
            {saving ? 'Saving...' : 'Save Mappings'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Mapping Grid */}
      <div className="grid gap-4">
        {mappings.map((mapping, index) => {
          const availableFields = getAvailableSchemaFields(
            mapping.schema_field
          );
          const isMapped = !!mapping.schema_field;

          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  {/* Excel Column */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">
                      Excel Column
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {mapping.excel_column}
                      </Badge>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    className={`h-5 w-5 ${
                      isMapped ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  />

                  {/* Schema Field */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">
                      Schema Field
                    </Label>
                    <Select
                      value={mapping.schema_field}
                      onValueChange={(value) =>
                        handleSchemaFieldChange(index, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          <span className="text-muted-foreground italic">
                            Skip this column
                          </span>
                        </SelectItem>
                        {availableFields.map((field) => (
                          <SelectItem key={field} value={field}>
                            <div className="flex items-center gap-2">
                              {field === mapping.schema_field && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                              <span className="font-mono text-sm">{field}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Info */}
      <Alert>
        <AlertDescription>
          <strong>Note:</strong> Only mapped columns will be processed. Unmapped
          columns will be ignored. Make sure to map all required fields like
          claim_number, provider_name, and invoice_amount_cents.
        </AlertDescription>
      </Alert>
    </div>
  );
}
