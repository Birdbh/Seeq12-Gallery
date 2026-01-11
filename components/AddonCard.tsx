import React, { useState, useEffect } from 'react';
import { GithubRepo, EnhancedAddonDetails } from '../types';
import { getRepoDetails, getReadmeImage, getFallbackImage } from '../services/githubService';
import { Star, GitFork, ExternalLink, Calendar, Activity, Box, Zap, Crown, User, BookOpen, ShieldCheck, FileText, Loader2 } from 'lucide-react';

interface AddonCardProps {
  repo: GithubRepo;
  enhancedDetails?: EnhancedAddonDetails;
  isAnalyzing: boolean;
}

export const AddonCard: React.FC<AddonCardProps> = ({ repo, enhancedDetails, isAnalyzing }) => {
  const metadata = repo.galleryMetadata;
  const isThirdParty = metadata?.category === 'Third Party';
  const isPremium = metadata?.isPremium;
  
  const [imageSrc, setImageSrc] = useState<string | null>(metadata?.thumbnailUrl || null);
  const [forkParent, setForkParent] = useState<{ full_name: string; html_url: string } | null>(repo.parent || null);

  useEffect(() => {
    let isMounted = true;

    const loadExtraDetails = async () => {
      // 1. Load Image from README if no manual thumbnail
      if (!metadata?.thumbnailUrl) {
        const readmeImg = await getReadmeImage(repo);
        if (isMounted) {
            if (readmeImg) {
                setImageSrc(readmeImg);
            } else {
                setImageSrc(getFallbackImage(repo));
            }
        }
      }

      // 2. Load Fork Details if needed
      if (repo.fork && !repo.parent) {
        const details = await getRepoDetails(repo.owner.login, repo.name);
        if (isMounted && details?.parent) {
          setForkParent(details.parent);
        }
      }
    };

    loadExtraDetails();
    return () => { isMounted = false; };
  }, [repo, metadata]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine Documentation Link: Priority > Metadata DocUrl > Homepage (if Pages) > Repo URL
  const documentationLink = metadata?.documentationUrl || 
                            (repo.homepage ? repo.homepage : null);

  return (
    <div className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group ${
      isPremium ? 'border-amber-200' : 'border-slate-200'
    }`}>
      
      {/* Image Header - ALWAYS present now */}
      <div className="h-40 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100 group">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={`${repo.name} cover`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
                // Fallback on error to the generic fallback
                (e.target as HTMLImageElement).src = getFallbackImage(repo);
            }}
          />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                <Box size={40} />
            </div>
        )}
        
        {isPremium && (
             <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
               <Crown size={12} /> PREMIUM
             </div>
        )}
      </div>

      {/* Card Header */}
      <div className={`p-5 pb-2 border-b flex-shrink-0 ${
        isPremium 
          ? 'bg-gradient-to-br from-amber-50 to-white border-amber-100' 
          : 'bg-white border-slate-100'
      }`}>
        <div className="flex justify-between items-start mb-1 gap-2">
          <div className="min-w-0 flex-grow">
            <h3 className="text-lg font-bold text-slate-800 leading-tight truncate" title={metadata?.displayName || repo.name}>
              {metadata?.displayName || repo.name}
            </h3>
            {metadata?.developer && (
              <p className="text-xs text-slate-500 flex items-center mt-1">
                 <User size={10} className="mr-1" /> {metadata.developer}
              </p>
            )}
            {/* Fork Info */}
            {repo.fork && (
                <div className="mt-1 text-xs text-slate-400 flex items-center truncate">
                   <GitFork size={10} className="mr-1" /> 
                   {forkParent ? (
                       <span className="truncate">Forked from <a href={forkParent.html_url} target="_blank" rel="noreferrer" className="hover:text-teal-600 hover:underline">{forkParent.full_name}</a></span>
                   ) : (
                       <span>Forked repository</span>
                   )}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 py-4 flex-grow flex flex-col space-y-4">
        <p className="text-slate-600 text-sm line-clamp-3 min-h-[40px] leading-relaxed">
           {/* Prefer AI summary if available, then manual extended description, then repo description */}
          {enhancedDetails?.aiSummary || metadata?.extendedDescription || repo.description || 'No description provided.'}
        </p>

        {/* Topics/Tags */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Enhanced AI Content Area - Automatic Display */}
        {isAnalyzing ? (
            <div className="pt-2 flex items-center gap-2 text-xs text-teal-600">
               <Loader2 size={12} className="animate-spin" />
               <span>Generating detailed insights...</span>
            </div>
        ) : enhancedDetails ? (
           <div className="space-y-3 animate-in fade-in duration-500 pt-2 border-t border-slate-100">
             <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-3 rounded-lg border border-teal-100">
               <h4 className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center">
                 <Zap size={10} className="mr-1 fill-current" /> Use Cases
               </h4>
               <ul className="text-xs text-teal-900 space-y-1 ml-1 list-disc list-inside">
                 {enhancedDetails.useCases.slice(0, 2).map((uc, i) => (
                   <li key={i} className="truncate">{uc}</li>
                 ))}
               </ul>
             </div>
           </div>
        ) : null}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-3">
          {!isThirdParty && (
            <>
              <div className="flex items-center space-x-1" title="Stars">
                <Star size={14} className="text-amber-400 fill-current" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center space-x-1" title="Last Updated">
                <Calendar size={14} />
                <span>{formatDate(repo.updated_at)}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
            {documentationLink && (
                 <a href={documentationLink} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-teal-600 hover:text-teal-800 hover:underline" title="Documentation">
                 <BookOpen size={14} /> <span>Docs</span>
               </a>
            )}
            
            {metadata?.licenseUrl ? (
                <a 
                href={metadata.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 hover:underline"
                title="View License"
                >
                <ShieldCheck size={14} /> <span>License</span>
                </a>
            ) : (
               metadata?.supportUrl ? (
                <a href={metadata.supportUrl} target="_blank" rel="noreferrer" className="hover:text-teal-600">Support</a>
               ) : null
            )}

            <a 
            href={repo.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-teal-600 transition-colors"
            title="View Code on GitHub"
            >
            <ExternalLink size={16} />
            </a>
        </div>
      </div>
    </div>
  );
};