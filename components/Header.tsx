import React from 'react';
import { Search, LayoutGrid, List as ListIcon, Info } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalRepos: number;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, viewMode, setViewMode, totalRepos }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 py-4 sm:py-0 gap-4">
          
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="h-10 w-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Seeq Gallery</h1>
              <p className="text-xs text-slate-500 font-medium">Community Ecosystem & Tools</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={`Search ${totalRepos} add-ons...`}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block">
                 <Info size={20} />
             </button>
             <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
               <button
                 onClick={() => setViewMode(ViewMode.GRID)}
                 className={`p-2 rounded-md transition-all duration-200 ${
                   viewMode === ViewMode.GRID 
                   ? 'bg-white text-teal-600 shadow-sm' 
                   : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <LayoutGrid size={18} />
               </button>
               <button
                 onClick={() => setViewMode(ViewMode.LIST)}
                 className={`p-2 rounded-md transition-all duration-200 ${
                   viewMode === ViewMode.LIST
                   ? 'bg-white text-teal-600 shadow-sm'
                   : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <ListIcon size={18} />
               </button>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};
