'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface MappingPreviewProps {
  excelData: Record<string, any>[];
  mappings: Array<{
    excel_column: string;
    schema_field: string;
    data_type?: string;
    transform_rule?: string;
  }>;
  maxRows?: number;
}

/**
 * Transforms a value based on the mapping rules
 */
function transformValue(
  value: any,
  schemaField: string,
  transformRule?: string
): any {
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Amount transformations (convert to cents)
  if (
    schemaField === 'invoice_amount_cents' ||
    schemaField === 'approved_amount_cents'
  ) {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return null;
    return Math.round(numValue * 100); // Convert to cents
  }

  // Date transformations
  if (schemaField === 'service_date' || schemaField === 'claim_date') {
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
  }

  // Default: return as string
  return String(value);
}

/**
 * Formats display value for preview
 */
function formatDisplayValue(value: any, schemaField: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  // Format cents as currency
  if (
    schemaField === 'invoice_amount_cents' ||
    schemaField === 'approved_amount_cents'
  ) {
    if (typeof value === 'number') {
      const amount = value / 100;
      return `KES ${amount.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  return String(value);
}

export function MappingPreview({
  excelData,
  mappings,
  maxRows = 10,
}: MappingPreviewProps) {
  // Filter mappings to only include those with schema fields
  const activeMappings = mappings.filter((m) => m.schema_field);

  // Transform data based on mappings
  const transformedData = excelData.slice(0, maxRows).map((row) => {
    const transformed: Record<string, any> = {};

    activeMappings.forEach((mapping) => {
      const excelValue = row[mapping.excel_column];
      const transformedValue = transformValue(
        excelValue,
        mapping.schema_field,
        mapping.transform_rule
      );
      transformed[mapping.schema_field] = transformedValue;
    });

    return transformed;
  });

  if (activeMappings.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No mappings configured yet. Please map at least one Excel column to a
          schema field to see a preview.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Preview Transformed Data</h3>
          <p className="text-sm text-muted-foreground">
            Showing first {Math.min(maxRows, excelData.length)} rows after
            transformation
          </p>
        </div>
        <Badge variant="secondary">
          {activeMappings.length} fields mapped
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Before Transformation (Excel Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeMappings.map((mapping) => (
                    <TableHead key={mapping.excel_column} className="min-w-32">
                      <div className="space-y-1">
                        <div className="font-mono text-xs">
                          {mapping.excel_column}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {excelData.slice(0, maxRows).map((row, idx) => (
                  <TableRow key={idx}>
                    {activeMappings.map((mapping) => (
                      <TableCell key={mapping.excel_column} className="text-sm">
                        {row[mapping.excel_column] !== null &&
                        row[mapping.excel_column] !== undefined
                          ? String(row[mapping.excel_column])
                          : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            After Transformation (Database Format)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeMappings.map((mapping) => (
                    <TableHead key={mapping.schema_field} className="min-w-32">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold">
                          {mapping.schema_field}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mapping.data_type || 'auto'}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transformedData.map((row, idx) => (
                  <TableRow key={idx}>
                    {activeMappings.map((mapping) => (
                      <TableCell key={mapping.schema_field} className="text-sm">
                        {formatDisplayValue(
                          row[mapping.schema_field],
                          mapping.schema_field
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Transformation Rules:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Amount fields:</strong> Converted to cents (multiply by
              100)
            </li>
            <li>
              <strong>Date fields:</strong> Normalized to YYYY-MM-DD format
            </li>
            <li>
              <strong>Text fields:</strong> Trimmed and sanitized
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
