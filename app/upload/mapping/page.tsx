'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColumnMapper, ColumnMappingData } from '@/components/upload/ColumnMapper';
import { MappingPreview } from '@/components/upload/MappingPreview';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function MappingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [excelData, setExcelData] = useState<Record<string, any>[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMappingData[]>([]);
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load batch data and existing mappings
  useEffect(() => {
    if (!batchId) {
      setError('No batch ID provided');
      setLoading(false);
      return;
    }

    loadBatchData();
    loadExistingMappings();
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      // Load Excel preview data from the API
      const response = await fetch(`/api/upload/preview?batchId=${batchId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load batch data');
      }

      if (data.data && data.data.length > 0) {
        setExcelData(data.data);
        // Extract column names from first row
        const columns = Object.keys(data.data[0]);
        setExcelColumns(columns);
      }

      setBatchInfo(data.batch);
      setLoading(false);
    } catch (err) {
      console.error('Error loading batch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load batch data');
      setLoading(false);
    }
  };

  const loadExistingMappings = async () => {
    try {
      const response = await fetch(`/api/upload/mapping?batchId=${batchId}`);
      const data = await response.json();

      if (response.ok && data.data && data.data.length > 0) {
        // Convert database mappings to component format
        const existingMappings: ColumnMappingData[] = data.data.map((m: any) => ({
          excel_column: m.excel_column,
          schema_field: m.schema_field,
          data_type: m.data_type,
          transform_rule: m.transform_rule,
        }));
        setMappings(existingMappings);
      }
    } catch (err) {
      console.error('Error loading existing mappings:', err);
      // Non-fatal error - just continue without pre-loaded mappings
    }
  };

  const handleMappingsChange = (newMappings: ColumnMappingData[]) => {
    setMappings(newMappings);
    setSuccess(false); // Reset success state when mappings change
  };

  const handleSaveMappings = async (mappingsToSave: ColumnMappingData[]) => {
    if (!batchId) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/upload/mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: parseInt(batchId),
          mappings: mappingsToSave,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save mappings');
      }

      setSuccess(true);

      // Optionally redirect to processing page after a delay
      setTimeout(() => {
        // You can add navigation to processing page here
        // router.push(`/upload/process?batchId=${batchId}`);
      }, 2000);
    } catch (err) {
      console.error('Error saving mappings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save mappings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading batch data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !excelData.length) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/upload">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/upload">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Column Mapping</h1>
            {batchInfo && (
              <p className="text-muted-foreground mt-1">
                File: {batchInfo.filename} ({batchInfo.total_rows} rows)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Mappings saved successfully! You can now proceed to process the data.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="mapper" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="mapper">Configure Mappings</TabsTrigger>
          <TabsTrigger value="preview">Preview Data</TabsTrigger>
        </TabsList>

        <TabsContent value="mapper" className="space-y-6">
          <ColumnMapper
            excelColumns={excelColumns}
            initialMappings={mappings}
            onMappingsChange={handleMappingsChange}
            onSave={handleSaveMappings}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {mappings.filter((m) => m.schema_field).length > 0 ? (
            <MappingPreview
              excelData={excelData}
              mappings={mappings}
              maxRows={10}
            />
          ) : (
            <Alert>
              <AlertDescription>
                Please configure at least one column mapping to see the preview.
                Switch to the "Configure Mappings" tab to get started.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <Button asChild variant="outline">
          <Link href="/upload">Cancel</Link>
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={() => handleSaveMappings(mappings.filter((m) => m.schema_field))}
            disabled={
              saving ||
              mappings.filter((m) => m.schema_field).length === 0
            }
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MappingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      }
    >
      <MappingPageContent />
    </Suspense>
  );
}
