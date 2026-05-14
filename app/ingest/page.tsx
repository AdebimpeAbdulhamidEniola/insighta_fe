'use client';

import { useState, useCallback } from 'react';
import { api, type IngestResponse } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
  X,
} from 'lucide-react';

export default function IngestPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const ingestionResult = await api.ingestCSV(csvFile);
      setResult(ingestionResult);
      if (ingestionResult.inserted > 0) {
        setCsvFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Ingestion</h1>
          <p className="text-muted-foreground mt-1">
            Bulk import profiles via CSV upload (admin only)
          </p>
        </div>

        {/* Result */}
        {result && (
          <Alert
            className={
              result.skipped > 0 ? 'border-warning' : 'border-primary/50 bg-primary/5'
            }
          >
            {result.skipped > 0 ? (
              <AlertCircle className="h-4 w-4 text-warning" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
            <AlertTitle>
              {result.inserted} profile{result.inserted !== 1 ? 's' : ''} inserted
              {result.skipped > 0 && `, ${result.skipped} skipped`}
            </AlertTitle>
            {result.skipped > 0 && (
              <AlertDescription>
                <div className="mt-2 text-sm space-y-1">
                  <p className="font-medium">Skip reasons:</p>
                  {result.reasons.duplicate_name > 0 && (
                    <p>• {result.reasons.duplicate_name} duplicate name(s)</p>
                  )}
                  {result.reasons.missing_fields > 0 && (
                    <p>• {result.reasons.missing_fields} missing required field(s)</p>
                  )}
                  {result.reasons.invalid_age > 0 && (
                    <p>• {result.reasons.invalid_age} invalid age/age_group value(s)</p>
                  )}
                  {result.reasons.invalid_gender > 0 && (
                    <p>• {result.reasons.invalid_gender} invalid gender value(s)</p>
                  )}
                  {result.reasons.malformed_row > 0 && (
                    <p>• {result.reasons.malformed_row} malformed row(s)</p>
                  )}
                </div>
              </AlertDescription>
            )}
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Card */}
        <Card
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={dragActive ? 'border-primary' : ''}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Upload CSV</CardTitle>
            </div>
            <CardDescription>
              CSV must include all required columns (see format guide below)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCsvSubmit} className="space-y-4">
              <div>
                {csvFile ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-secondary/30">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{csvFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(csvFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCsvFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <FileUp className="h-10 w-10 text-muted-foreground mb-3" />
                    <span className="font-medium">Drop CSV file here or click to browse</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Required columns: name, gender, gender_probability, age, age_group,
                      country_id, country_probability
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !csvFile}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Import CSV
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Format Guide */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">CSV Format</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-secondary/50 overflow-x-auto text-sm font-mono">
{`name,gender,gender_probability,age,age_group,country_id,country_probability,country_name
John Smith,male,0.98,37,adult,GB,0.52,United Kingdom
Maria Garcia,female,0.95,28,adult,ES,0.71,Spain
Ahmed Hassan,male,0.89,45,adult,EG,0.63,Egypt`}
            </pre>
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Required: name</Badge>
                <Badge variant="outline">Required: gender (male/female)</Badge>
                <Badge variant="outline">Required: gender_probability</Badge>
                <Badge variant="outline">Required: age (integer)</Badge>
                <Badge variant="outline">Required: age_group (child/teenager/adult/senior)</Badge>
                <Badge variant="outline">Required: country_id (2-letter ISO)</Badge>
                <Badge variant="outline">Required: country_probability</Badge>
                <Badge variant="secondary">Optional: country_name</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
