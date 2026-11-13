'use client';

import React, { useEffect } from 'react';
import { HiX, HiExternalLink, HiDownload, HiDocumentText } from 'react-icons/hi';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  fileUrl?: string;
  blobUrl?: string;
  fileBase64?: string;
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  fileName = 'Resume_Document.pdf',
  fileUrl,
  blobUrl,
  fileBase64,
}: ResumePreviewModalProps) {
  // Listen for Escape key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute active URL: prefer blobUrl (instant in-memory), then fileUrl, then base64
  const activeUrl = blobUrl || fileUrl || fileBase64 || '';
  const isPdf = fileName.toLowerCase().endsWith('.pdf') || (fileBase64 && fileBase64.includes('application/pdf'));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-navy-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-navy-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-navy-900 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-white border-b border-navy-800">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-primary-600/30 text-primary-400 rounded-xl shrink-0">
              <HiDocumentText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 id="resume-modal-title" className="text-xs sm:text-base font-bold text-white truncate max-w-[180px] sm:max-w-md">
                {fileName}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-navy-400 font-medium truncate">Document Preview • Gentrobyte Secure Storage</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {activeUrl && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-bold text-navy-200 transition-colors"
                title="Open in new window"
                aria-label="Open document in new tab"
              >
                <span className="hidden sm:inline">New Tab</span>
                <HiExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close document preview modal"
            >
              <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content / Preview Area */}
        <div className="flex-1 bg-navy-50/50 p-2.5 sm:p-6 overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          {activeUrl ? (
            isPdf ? (
              <iframe
                src={`${activeUrl}#toolbar=0`}
                title="Resume Document Preview"
                className="w-full h-[55vh] sm:h-[60vh] rounded-xl sm:rounded-2xl bg-white shadow-inner border border-navy-200"
              />
            ) : (
              <div className="w-full h-[55vh] sm:h-[60vh] flex flex-col items-center justify-center bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-navy-200">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiDocumentText className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-navy-900 mb-1">{fileName}</h4>
                <p className="text-xs text-navy-500 max-w-sm mb-6">
                  This document format can be inspected directly in your system&apos;s default viewer or downloaded.
                </p>
                <div className="flex gap-3">
                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <HiExternalLink className="w-4 h-4" />
                    <span>Open Document</span>
                  </a>
                  <a
                    href={activeUrl}
                    download={fileName}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-navy-100 text-navy-800 rounded-xl text-xs font-bold hover:bg-navy-200 transition-colors"
                  >
                    <HiDownload className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="text-center p-8 text-navy-400">
              <p className="text-sm font-semibold">No document preview source is currently available.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-t border-navy-100 flex items-center justify-between">
          <span className="text-xs text-navy-500 font-medium hidden sm:inline">
            Status: <strong className="text-green-600 font-bold">Encrypted &amp; Stored Securely</strong>
          </span>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {activeUrl && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-100 text-navy-800 text-xs font-bold"
              >
                <span>Open in Tab</span>
                <HiExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

