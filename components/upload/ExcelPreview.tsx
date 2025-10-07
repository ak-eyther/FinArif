'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { ExcelRow } from '@/lib/utils/excel-parser';

export interface ExcelPreviewProps {
  filename: string;
  totalRows: number;
  previewRows: ExcelRow[];
  headers: string[];
  batchId: number;
}

export function ExcelPreview({
  filename,
  totalRows,
  previewRows,
  headers,
  batchId,
}: ExcelPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Upload Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload Successful</CardTitle>
                <CardDescription>File parsed and validated</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">Batch #{batchId}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{filename}</p>
                <p className="text-xs text-muted-foreground">Filename</p>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRows}</p>
              <p className="text-xs text-muted-foreground">Total Rows</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{headers.length}</p>
              <p className="text-xs text-muted-foreground">Columns Detected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preview (First 10 Rows)</CardTitle>
          <CardDescription>
            Review the data before proceeding to mapping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[120px]">Claim Number</TableHead>
                    <TableHead className="min-w-[120px]">Member Number</TableHead>
                    <TableHead className="min-w-[150px]">Patient Name</TableHead>
                    <TableHead className="min-w-[150px]">Provider Name</TableHead>
                    <TableHead className="min-w-[150px]">Payer Name</TableHead>
                    <TableHead className="min-w-[150px]">Scheme Name</TableHead>
                    <TableHead className="min-w-[100px]">Service Date</TableHead>
                    <TableHead className="min-w-[100px]">Claim Date</TableHead>
                    <TableHead className="min-w-[120px] text-right">Invoice Amount</TableHead>
                    <TableHead className="min-w-[120px] text-right">Approved Amount</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Diagnosis Code</TableHead>
                    <TableHead className="min-w-[120px]">Procedure Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                        No data to preview
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewRows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{row.claimNumber}</TableCell>
                        <TableCell>{row.memberNumber}</TableCell>
                        <TableCell>{row.patientName}</TableCell>
                        <TableCell>{row.providerName}</TableCell>
                        <TableCell>{row.payerName}</TableCell>
                        <TableCell>{row.schemeName}</TableCell>
                        <TableCell>{row.serviceDate}</TableCell>
                        <TableCell>{row.claimDate}</TableCell>
                        <TableCell className="text-right">{row.invoiceAmount}</TableCell>
                        <TableCell className="text-right">{row.approvedAmount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {row.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.diagnosisCode}</TableCell>
                        <TableCell>{row.procedureCode}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
