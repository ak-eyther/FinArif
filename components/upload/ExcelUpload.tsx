'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ExcelRow, UploadPreviewResponse } from '@/app/api/upload/preview/route';

export interface ExcelUploadProps {
  onUploadSuccess: (data: {
    batchId: number;
    filename: string;
    totalRows: number;
    previewRows: ExcelRow[];
    headers: string[];
  }) => void;
  onUploadError?: (error: string) => void;
}

export function ExcelUpload({ onUploadSuccess, onUploadError }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      onUploadError?.('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.('File is too large. Maximum size is 10MB');
      return;
    }

    setSelectedFile(file);
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    []
  );

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload file to API
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload/preview', {
        method: 'POST',
        body: formData,
      });

      const data: UploadPreviewResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.batchId && data.filename && data.totalRows !== undefined && data.previewRows && data.headers) {
        onUploadSuccess({
          batchId: data.batchId,
          filename: data.filename,
          totalRows: data.totalRows,
          previewRows: data.previewRows,
          headers: data.headers,
        });
        setSelectedFile(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>

              <div>
                <p className="text-lg font-medium mb-1">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
                id="file-upload"
              />

              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Select File</span>
                </Button>
              </label>

              <p className="text-xs text-muted-foreground">
                Supports .xlsx and .xls files up to 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Preview
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
