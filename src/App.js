import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, ChevronRight, X } from 'lucide-react';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocumentSelect = async (document) => {
    setSelectedDocument(document);
    setShowDropdown(false);
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/document/${encodeURIComponent(document.id)}`);
      const data = await response.json();
      setDocumentContent(data.content || '');
    } catch (error) {
      console.error('Document fetch error:', error);
      setDocumentContent('Error loading document content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedDocument(null);
    setDocumentContent('');
    setSearchQuery('');
  };

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to search
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-gray-400" />
              <h1 className="text-2xl font-semibold text-gray-900">{selectedDocument.name}</h1>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {documentContent}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Document Search</h1>
          <p className="text-gray-600">Search and view documents from your database</p>
        </div>
        
        <div ref={searchRef} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for documents..."
              className="w-full px-12 py-4 text-lg bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
              {searchResults.map((doc, index) => (
                <button
                  key={doc.id || index}
                  onClick={() => handleDocumentSelect(doc)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        {doc.preview && (
                          <div className="text-sm text-gray-500 truncate">{doc.preview}</div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {showDropdown && isSearching && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            </div>
          )}
          
          {showDropdown && !isSearching && searchResults.length === 0 && searchQuery && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
              <p className="text-center text-gray-500">No documents found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;