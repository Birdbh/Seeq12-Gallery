import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GithubRepo, EnhancedAddonDetails, ViewMode, SortOption } from './types';
import { fetchSeeqRepos } from './services/githubService';
import { analyzeRepoWithGemini } from './services/geminiService';
import { Header } from './components/Header';
import { AddonCard } from './components/AddonCard';
import { Loader2, ShieldAlert, Filter, Box, Users, ShoppingBag } from 'lucide-react';

// Tabs definition
enum TabType {
  OFFICIAL = 'official',
  THIRD_PARTY = 'third-party',
  COMMUNITY = 'community'
}

const App: React.FC = () => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.OFFICIAL);
  
  // Community Sort State
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.UPDATED);

  // AI Analysis State
  const [analyzingIds, setAnalyzingIds] = useState<Set<number>>(new Set());
  const [enhancedDetails, setEnhancedDetails] = useState<Record<number, EnhancedAddonDetails>>({});
  
  // Queue Ref for sequential processing
  const queueRef = useRef<GithubRepo[]>([]);
  const processingRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await fetchSeeqRepos();
      setRepos(data);
      setLoading(false);
      
      // Start background analysis process
      queueRef.current = [...data];
      processQueue();
    };
    init();
  }, []);

  const processQueue = async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    const batchSize = 1; // Process 1 at a time to be gentle on rate limits
    const item = queueRef.current.shift();

    if (item && !enhancedDetails[item.id]) {
      setAnalyzingIds(prev => new Set(prev).add(item.id));
      
      // Artificial delay to prevent instant rate limiting loops
      await new Promise(r => setTimeout(r, 1000)); 

      try {
        const details = await analyzeRepoWithGemini(
            item.name, 
            item.description || '', 
            item.topics, 
            item.language
        );
        
        setEnhancedDetails(prev => ({
            ...prev,
            [item.id]: { ...details, repoId: item.id }
        }));
      } catch (e) {
          console.error("Failed to analyze", item.name);
      } finally {
         setAnalyzingIds(prev => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
         });
      }
    }

    processingRef.current = false;
    
    // Continue queue
    if (queueRef.current.length > 0) {
        processQueue();
    }
  };

  // Grouping logic
  const { officialRepos, thirdPartyRepos, communityRepos } = useMemo(() => {
    const filtered = repos.filter(repo => {
      const searchLower = searchTerm.toLowerCase();
      const metadataName = repo.galleryMetadata?.displayName?.toLowerCase() || '';
      return (
        repo.name.toLowerCase().includes(searchLower) ||
        metadataName.includes(searchLower) || 
        (repo.description && repo.description.toLowerCase().includes(searchLower)) ||
        repo.topics.some(t => t.toLowerCase().includes(searchLower))
      );
    });

    // Helper for community sorting
    const sortFn = (a: GithubRepo, b: GithubRepo) => {
        if (sortOption === SortOption.STARS) return b.stargazers_count - a.stargazers_count;
        if (sortOption === SortOption.NAME) return a.name.localeCompare(b.name);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    };

    const commRepos = filtered.filter(r => r.galleryMetadata?.section === 'community' || !r.galleryMetadata?.section);
    
    // Only sort community repos based on the dropdown
    commRepos.sort(sortFn);

    return {
      officialRepos: filtered.filter(r => r.galleryMetadata?.section === 'official'),
      thirdPartyRepos: filtered.filter(r => r.galleryMetadata?.section === 'third-party'),
      communityRepos: commRepos
    };
  }, [repos, searchTerm, sortOption]);

  const RepoGrid = ({ items }: { items: GithubRepo[] }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
           <p className="text-slate-500">No add-ons found matching your search.</p>
        </div>
      );
    }
    return (
      <div className={`grid gap-6 ${viewMode === ViewMode.GRID ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {items.map(repo => (
          <AddonCard 
            key={repo.id} 
            repo={repo} 
            enhancedDetails={enhancedDetails[repo.id]}
            isAnalyzing={analyzingIds.has(repo.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        totalRepos={repos.length}
      />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome & Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Seeq Add-on Gallery</h1>
          <p className="text-lg text-slate-600 mb-6 max-w-3xl">
            The central hub for first and third-party extensions. Use the tabs below to explore official Seeq tools, premium partner solutions, or open-source community contributions.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                 <ShieldAlert size={18} /> Support Expectations
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed mb-2">
                <strong>First-Party (Open Source):</strong> Supported via GitHub Issues. Not covered by standard Seeq SLAs.
            </p>
            <p className="text-sm text-blue-800 leading-relaxed mb-2">
                <strong>Third-Party:</strong> Supported by the respective vendor/partner. May require a license.
            </p>
             <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Community:</strong> Provided "as-is" by the open source community.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex p-1 bg-slate-200 rounded-lg self-start sm:self-auto">
                <button
                    onClick={() => setActiveTab(TabType.OFFICIAL)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === TabType.OFFICIAL 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Box size={16} />
                    <span>Seeq Official</span>
                    <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                        {officialRepos.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab(TabType.THIRD_PARTY)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === TabType.THIRD_PARTY 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <ShoppingBag size={16} />
                    <span>Partner Solutions</span>
                    <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                        {thirdPartyRepos.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab(TabType.COMMUNITY)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === TabType.COMMUNITY 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Users size={16} />
                    <span>Community</span>
                    <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                        {communityRepos.length}
                    </span>
                </button>
            </div>

            {/* Controls (Sort) - Visible mostly for Community tab or if relevant */}
            {activeTab === TabType.COMMUNITY && (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">Sort by:</span>
                    <div className="relative">
                        <select 
                            className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                        >
                            <option value={SortOption.UPDATED}>Last Updated</option>
                            <option value={SortOption.STARS}>Most Stars</option>
                            <option value={SortOption.NAME}>Name (A-Z)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 size={40} className="text-teal-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading ecosystem data...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             {activeTab === TabType.OFFICIAL && (
                <div>
                     <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Seeq Official Add-ons</h2>
                        <p className="text-slate-500">Open source add-ons developed and supported by Seeq. Issues tracked via GitHub.</p>
                     </div>
                     <RepoGrid items={officialRepos} />
                </div>
             )}

             {activeTab === TabType.THIRD_PARTY && (
                 <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Third Party Add-ons</h2>
                        <p className="text-slate-500">Developed by partners. Support provided by the maintainer. May require licenses.</p>
                    </div>
                    <RepoGrid items={thirdPartyRepos} />
                </div>
             )}

             {activeTab === TabType.COMMUNITY && (
                 <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Community Tools</h2>
                        <p className="text-slate-500">Scripts, SDKs, and experimental tools contributed by the Seeq user community.</p>
                    </div>
                    <RepoGrid items={communityRepos} />
                </div>
             )}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
           <p className="mb-2">Built as a contribution to the Seeq community.</p>
           <p className="text-xs">
             Data fetched from GitHub API. Not officially affiliated with Seeq Corporation.
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;