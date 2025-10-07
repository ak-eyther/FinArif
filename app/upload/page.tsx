'use client';

import { useState } from 'react';
import { ExcelUpload } from '@/components/upload/ExcelUpload';
import { ExcelPreview } from '@/components/upload/ExcelPreview';
import { ExcelRow } from '@/lib/utils/excel-parser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Upload as UploadIcon } from 'lucide-react';

interface UploadData {
  batchId: number;
  filename: string;
  totalRows: number;
  previewRows: ExcelRow[];
  headers: string[];
}

export default function UploadPage() {
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadData(data);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setUploadData(null);
  };

  const handleReset = () => {
    setUploadData(null);
    setError(null);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UploadIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Excel Upload</h1>
        </div>
        <p className="text-muted-foreground">
          Upload your claims data in Excel format. The file should contain 14 columns
          as specified in the template.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload or Preview */}
      {!uploadData ? (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              Before you upload:
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">1.</span>
                <span>
                  Ensure your Excel file has <strong>14 columns</strong> in the
                  correct order
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">2.</span>
                <span>
                  Column headers should match: Claim Number, Member Number, Patient
                  Name, Provider Name, Payer Name, Scheme Name, Service Date,
                  Claim Date, Invoice Amount, Approved Amount, Status, Diagnosis
                  Code, Procedure Code, Reserved
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">3.</span>
                <span>File must be in .xlsx or .xls format (max 10MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">4.</span>
                <span>Remove any empty rows or formatting issues</span>
              </li>
            </ul>
          </div>

          {/* Upload Component */}
          <ExcelUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <ExcelPreview
            batchId={uploadData.batchId}
            filename={uploadData.filename}
            totalRows={uploadData.totalRows}
            previewRows={uploadData.previewRows}
            headers={uploadData.headers}
          />

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium mb-1">Ready to proceed?</p>
              <p className="text-sm text-muted-foreground">
                The next step is to map columns to your database schema
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>
                Upload Different File
              </Button>
              <Button disabled>
                Continue to Mapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Next Steps</AlertTitle>
            <AlertDescription>
              Column mapping feature is coming in the next release. For now, you
              can review the preview data to ensure it was parsed correctly.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
