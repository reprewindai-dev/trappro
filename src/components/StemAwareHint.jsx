import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function StemAwareHint({ detectionResults }) {
  if (!detectionResults || detectionResults.isFullMix) {
    return null;
  }

  return (
    <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-yellow-300 mb-2">
            Stems Detected
          </div>
          <div className="text-sm text-yellow-200/80 mb-2">
            TrapMasterPro works best with full mixes (vocals + beat together).
          </div>
          {detectionResults.hints.length > 0 && (
            <div className="space-y-1 mb-3">
              {detectionResults.hints.map((hint, i) => (
                <div key={i} className="text-xs text-yellow-200/60 flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  {hint}
                </div>
              ))}
            </div>
          )}
          {detectionResults.recommendations.length > 0 && (
            <div className="text-xs text-yellow-200/80">
              <strong>Tip:</strong> {detectionResults.recommendations[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
