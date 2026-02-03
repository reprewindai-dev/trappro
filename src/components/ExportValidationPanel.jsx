import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function ExportValidationPanel({ validation }) {
  if (!validation) return null;

  const getStatusIcon = (valid, hasWarnings, hasErrors) => {
    if (hasErrors) return <XCircle className="w-5 h-5 text-red-400" />;
    if (hasWarnings) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    if (valid) return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    return <Info className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (valid, hasWarnings, hasErrors) => {
    if (hasErrors) return 'border-red-700/30 bg-red-900/20';
    if (hasWarnings) return 'border-yellow-700/30 bg-yellow-900/20';
    if (valid) return 'border-green-700/30 bg-green-900/20';
    return 'border-gray-700/30 bg-gray-900/20';
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(validation.valid, validation.hasWarnings, validation.hasErrors)}`}>
      <div className="flex items-start gap-3 mb-3">
        {getStatusIcon(validation.valid, validation.hasWarnings, validation.hasErrors)}
        <div className="flex-1">
          <div className="font-medium text-white mb-1">Export Validation</div>
          <div className="text-xs text-gray-400">
            {validation.valid 
              ? 'Export meets specifications' 
              : validation.hasErrors 
                ? 'Export has errors - check details below'
                : 'Export completed with warnings'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-gray-400">Sample Rate</div>
          <div className="text-white font-mono">{validation.sampleRate}</div>
        </div>
        <div>
          <div className="text-gray-400">Bit Depth</div>
          <div className="text-white font-mono">{validation.bitDepth}</div>
        </div>
        <div>
          <div className="text-gray-400">True Peak</div>
          <div className="text-white font-mono">{validation.truePeak}</div>
        </div>
        <div>
          <div className="text-gray-400">LUFS</div>
          <div className="text-white font-mono">{validation.lufs}</div>
        </div>
      </div>

      {validation.hasWarnings && (
        <div className="mt-3 pt-3 border-t border-yellow-700/30">
          <div className="text-xs text-yellow-300 font-medium mb-1">Warnings:</div>
          <div className="text-xs text-yellow-200/80">
            Check console for detailed warnings
          </div>
        </div>
      )}

      {validation.hasErrors && (
        <div className="mt-3 pt-3 border-t border-red-700/30">
          <div className="text-xs text-red-300 font-medium mb-1">Errors:</div>
          <div className="text-xs text-red-200/80">
            Check console for detailed errors
          </div>
        </div>
      )}
    </div>
  );
}
