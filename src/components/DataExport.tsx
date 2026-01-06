import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, FileJson, FileSpreadsheet, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import type { ExportData } from '../types';

interface DataExportProps {
    onExport: () => Promise<ExportData>;
    onImport: (data: ExportData) => Promise<boolean>;
}

export function DataExportImport({ onExport, onImport }: DataExportProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExportJSON = async () => {
        if (isExporting) return;
        setIsExporting(true);
        setError(null);

        try {
            const data = await onExport();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `grit_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            setError('エクスポートに失敗しました');
            console.error('Export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportCSV = async () => {
        if (isExporting) return;
        setIsExporting(true);
        setError(null);

        try {
            const data = await onExport();

            // Convert weight logs to CSV
            const weightHeaders = ['日付', '体重(kg)', '体脂肪率(%)'];
            const weightRows = data.weightLogs.map((log) => [
                log.date,
                log.weight.toString(),
                log.fat_percentage?.toString() || '',
            ]);

            const csvContent = [
                weightHeaders.join(','),
                ...weightRows.map((row) => row.join(',')),
            ].join('\n');

            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `grit_weight_logs_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            setError('エクスポートに失敗しました');
            console.error('Export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || isImporting) return;

        setIsImporting(true);
        setError(null);

        try {
            const text = await file.text();
            const data = JSON.parse(text) as ExportData;

            // Validate data structure
            if (!data.weightLogs || !Array.isArray(data.weightLogs)) {
                throw new Error('Invalid data format');
            }

            const success = await onImport(data);
            if (success) {
                setImportSuccess(true);
                setTimeout(() => setImportSuccess(false), 3000);
            } else {
                setError('インポートに失敗しました');
            }
        } catch (err) {
            setError('ファイルの読み込みに失敗しました。正しい形式のJSONファイルを選択してください。');
            console.error('Import error:', err);
        } finally {
            setIsImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <div className="glass-card rounded-2xl p-5">
            <h3 className="text-base font-semibold text-grit-text mb-4">データ管理</h3>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2"
                    >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-red-500" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {/* Export JSON */}
                <button
                    onClick={handleExportJSON}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-grit-surface-hover hover:bg-grit-border transition-colors group"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        {isExporting ? (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : exportSuccess ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <FileJson className="w-5 h-5 text-blue-500" />
                        )}
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-grit-text">JSONでエクスポート</p>
                        <p className="text-sm text-grit-text-muted">すべてのデータをバックアップ</p>
                    </div>
                    <Download className="w-5 h-5 text-grit-text-muted group-hover:text-grit-text transition-colors" />
                </button>

                {/* Export CSV */}
                <button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-grit-surface-hover hover:bg-grit-border transition-colors group"
                >
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-grit-text">CSVでエクスポート</p>
                        <p className="text-sm text-grit-text-muted">体重ログをスプレッドシート形式で</p>
                    </div>
                    <Download className="w-5 h-5 text-grit-text-muted group-hover:text-grit-text transition-colors" />
                </button>

                {/* Import JSON */}
                <label className="w-full flex items-center gap-3 p-4 rounded-xl bg-grit-surface-hover hover:bg-grit-border transition-colors cursor-pointer group">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        disabled={isImporting}
                        className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        {isImporting ? (
                            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                        ) : importSuccess ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <Upload className="w-5 h-5 text-purple-500" />
                        )}
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-grit-text">JSONからインポート</p>
                        <p className="text-sm text-grit-text-muted">バックアップからデータを復元</p>
                    </div>
                    <Upload className="w-5 h-5 text-grit-text-muted group-hover:text-grit-text transition-colors" />
                </label>
            </div>

            <p className="mt-4 text-xs text-grit-text-dim text-center">
                定期的にバックアップすることをお勧めします
            </p>
        </div>
    );
}
