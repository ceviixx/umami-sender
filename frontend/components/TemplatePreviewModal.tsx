'use client'

import { useEffect, useState } from 'react';

const TemplatePreviewModal = ({ isOpen, onClose, content }: { isOpen: boolean, onClose: () => void, content: string }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Sicherstellen, dass das Modal erst im Client gerendert wird
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">Template Preview</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">Close</button>
        </div>
        <div className="mt-4" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
