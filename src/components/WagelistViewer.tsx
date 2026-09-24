import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function WagelistViewer() {
  const [searchParams] = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl) {
      setError('No file URL provided');
      setLoading(false);
      return;
    }

    fetchHtmlContent();
  }, [fileUrl]);

  async function fetchHtmlContent() {
    try {
      setLoading(true);
      const response = await fetch(fileUrl!);
      
      if (!response.ok) {
        throw new Error('Failed to fetch HTML file');
      }
      
      const content = await response.text();
      setHtmlContent(content);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HTML file');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wagelist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
          <a 
            href={fileUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Download File Instead
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div 
        className="w-full"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
