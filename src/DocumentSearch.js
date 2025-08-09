// DocumentSearch.js
import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, ChevronRight, X } from 'lucide-react';

const DocumentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('search'); // 'search', 'team', 'document'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDocuments, setTeamDocuments] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
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
      if (searchQuery.trim() && currentView === 'search') {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentView]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Search results:', data);
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
    setCurrentView('document');
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/document/${encodeURIComponent(document.id)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Document content loaded:', data);
      setDocumentContent(data.content || '');
    } catch (error) {
      console.error('Document fetch error:', error);
      setDocumentContent('Error loading document content. Please check if the backend is running and the document exists.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamDocuments = async (team) => {
    setSelectedTeam(team);
    setCurrentView('team');
    setIsLoadingTeam(true);
    
    try {
      const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(team)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTeamDocuments(data.results || []);
    } catch (error) {
      console.error('Error loading team documents:', error);
      setTeamDocuments([]);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedDocument(null);
    setDocumentContent('');
    setSearchQuery('');
    setSelectedTeam(null);
    setTeamDocuments([]);
  };

  const handleBackToTeam = () => {
    setCurrentView('team');
    setSelectedDocument(null);
    setDocumentContent('');
  };

  const getTeamColor = (team) => {
    switch (team) {
      case 'Ferrari':
        return 'red';
      case 'Mercedes':
        return 'teal';
      case 'McLaren':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Document View
  if (currentView === 'document' && selectedDocument) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={selectedTeam ? handleBackToTeam : handleBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to {selectedTeam ? `${selectedTeam} documents` : 'search'}
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
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                  {documentContent.split('\n').map((paragraph, index) => {
                    if (!paragraph.trim()) return null;
                    
                    const isHeading = paragraph === paragraph.toUpperCase() || paragraph.endsWith(':');
                    
                    if (isHeading) {
                      return (
                        <h3 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-3">
                          {paragraph}
                        </h3>
                      );
                    }
                    
                    const isList = paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•');
                    
                    if (isList) {
                      return (
                        <li key={index} className="ml-6 mb-2 text-gray-700">
                          {paragraph.replace(/^[-•]\s*/, '')}
                        </li>
                      );
                    }
                    
                    return (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Team Documents View
  if (currentView === 'team' && selectedTeam) {
    const teamColor = getTeamColor(selectedTeam);
    
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
          
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-semibold text-${teamColor}-600 mb-2`}>{selectedTeam}</h1>
            <p className="text-gray-600">Browse all {selectedTeam} documents</p>
          </div>

          {isLoadingTeam ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {teamDocuments.length > 0 ? (
                teamDocuments.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    onClick={() => handleDocumentSelect(doc)}
                    className={`bg-white border-2 border-${teamColor}-200 rounded-lg p-6 cursor-pointer hover:border-${teamColor}-400 hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className={`w-8 h-8 text-${teamColor}-500`} />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                          {doc.preview && (
                            <p className="text-sm text-gray-500 mt-1">{doc.preview}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No {selectedTeam} documents found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Search View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Welcome, Bobby!</h1>
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

        {/* Team Boxes */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {/* Ferrari Box */}
            <div 
              onClick={() => loadTeamDocuments('Ferrari')}
              className="border-2 border-red-200 rounded-lg p-4 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all group"
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-medium text-gray-900">Ferrari</h3>
                <p className="text-xs text-gray-500 mt-1">View Ferrari documents</p>
              </div>
            </div>

            {/* Mercedes Box */}
            <div 
              onClick={() => loadTeamDocuments('Mercedes')}
              className="border-2 border-teal-200 rounded-lg p-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all group"
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-teal-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-medium text-gray-900">Mercedes</h3>
                <p className="text-xs text-gray-500 mt-1">View Mercedes documents</p>
              </div>
            </div>

            {/* McLaren Box */}
            <div 
              onClick={() => loadTeamDocuments('McLaren')}
              className="border-2 border-orange-200 rounded-lg p-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-medium text-gray-900">McLaren</h3>
                <p className="text-xs text-gray-500 mt-1">View McLaren documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSearch;