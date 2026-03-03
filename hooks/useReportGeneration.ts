
import { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ReportData, CampaignMetadata, ResourceLinks, SlideConfig, SocialPost } from '../types';

interface UseReportGenerationProps {
  gemini: GeminiService;
  setReportData: (data: ReportData) => void;
  setCurrentStep: (step: any) => void;
  uploadedFiles: any[];
  metadata: CampaignMetadata;
  resources: ResourceLinks;
}

const DEFAULT_TITLES = [
  "IIoT World Report", "Executive Overview", "X Channel Performance", "Top X Interactions",
  "LinkedIn Channel Performance", "Top LinkedIn Highlights", "LinkedIn Post Inventory",
  "Promoted Website Content", "Video Interview Content", "Video Collateral Assets",
  "Creative & Graphic Assets", "LINKEDIN NEWSLETTER PLACEMENTS", "IIoT World Newsletter Inserts",
  "X (Twitter) Content Metrics"
];

const DEFAULT_SLIDE_IDS = [
  'cover', 'executive', 'x_performance', 'x_top', 'linkedin_performance', 
  'linkedin_top', 'linkedin_inventory', 'website_content', 'video_interviews', 
  'video_collateral', 'creative_assets', 'newsletter_placements', 
  'iiot_newsletter_inserts', 'x_metrics'
];

export const useReportGeneration = ({ 
  gemini, setReportData, setCurrentStep, uploadedFiles, metadata, resources 
}: UseReportGenerationProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLIAnalyzing, setIsLIAnalyzing] = useState(false);
  const [isXAnalyzing, setIsXAnalyzing] = useState(false);
  const [liDataBuffer, setLiDataBuffer] = useState<any>(null);
  const [xDataBuffer, setXDataBuffer] = useState<any>(null);

  const generateLIMetrics = async () => {
    setIsLIAnalyzing(true);
    try {
      const results = await gemini.analyzeLinkedInData(uploadedFiles, metadata);
      setLiDataBuffer(results);
    } catch (e) {
      console.error(e);
      alert("LinkedIn analysis failed. Check console for details.");
    } finally {
      setIsLIAnalyzing(false);
    }
  };

  const generateXMetrics = async () => {
    setIsXAnalyzing(true);
    try {
      const results = await gemini.analyzeXData(uploadedFiles, metadata);
      setXDataBuffer(results);
    } catch (e) {
      console.error(e);
      alert("X analysis failed. Check console for details.");
    } finally {
      setIsXAnalyzing(false);
    }
  };

  const runAnalysis = async (ReportStepPreview: any, existingData: ReportData | null) => {
    setIsAnalyzing(true);
    try {
      // Always run basic analysis to get Titles/Captions for ANY new links found in resources
      const results = await gemini.analyzeReportFiles(uploadedFiles, metadata, resources);
      
      let newReportData: ReportData;

      if (existingData) {
          // --- SMART MERGE LOGIC ---
          // Use existing data as base to preserve custom slides and manual edits.
          
          // PREPARE FRESH METRICS (If available in buffer, use them; otherwise keep existing)
          let freshLiMetrics = existingData.linkedinMetrics;
          let freshLiNewsletters = existingData.linkedinNewsletters;
          let freshLiTopPosts = existingData.topLinkedinPosts;
          let freshLiAllPosts = existingData.allLinkedinPosts;
          
          if (liDataBuffer) {
             // Overwrite with fresh LinkedIn Data
             freshLiMetrics = {
                impressions: String(liDataBuffer.executiveSummary?.totalImpressions || '0'),
                engagement: String(liDataBuffer.executiveSummary?.totalEngagements || '0'),
                views: String(liDataBuffer.executiveSummary?.totalViews || '0'),
                totalPosts: String(liDataBuffer.executiveSummary?.totalPostCount || '0'),
                totalReactions: String(liDataBuffer.executiveSummary?.reactions || '0'),
                totalComments: String(liDataBuffer.executiveSummary?.comments || '0'),
                totalClicks: String(liDataBuffer.executiveSummary?.clicks || '0'),
                totalReposts: String(liDataBuffer.executiveSummary?.reposts || '0'),
             };
             const newsletters = liDataBuffer.newsletterAnalysis?.articles || [];
             freshLiNewsletters = newsletters.map((p: any, idx: number) => ({ ...p, id: `ln-${idx}`, platform: 'LinkedIn', impressions: String(p.impressions || '0'), reactions: '0', link: p.link || '' }));
             freshLiTopPosts = (liDataBuffer.top4Posts || []).map((p: any, idx: number) => ({ ...p, id: `tl-${idx}`, platform: 'LinkedIn', impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'), link: p.link || '' }));
             freshLiAllPosts = (liDataBuffer.postDetailTable || []).map((p: any, idx: number) => ({ 
                ...p, title: p.snippet, id: `ali-${idx}`, platform: 'LinkedIn' as const,
                impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'),
                clicks: String(p.clicks || '0'), comments: String(p.comments || '0'),
                reposts: String(p.reposts || '0'), engagements: String(p.engagements || '0'), reach: '0',
                views: String(p.views || '0')
             }));
          }

          let freshXMetrics = existingData.xMetrics;
          let freshXTopPosts = existingData.topXPosts;

          if (xDataBuffer) {
             // Overwrite with fresh X Data
             freshXMetrics = {
                reach: String(xDataBuffer.xMetrics?.reach || '0'),
                mentions: String(xDataBuffer.xMetrics?.mentions || '0'),
                impressions: String(xDataBuffer.xMetrics?.impressions || '0'),
                engagement: String(xDataBuffer.xMetrics?.engagement || '0'),
                rate: String(xDataBuffer.xMetrics?.rate || '0%')
             };
             freshXTopPosts = (xDataBuffer.topXPosts || []).map((p: any, idx: number) => ({ ...p, id: `tx-${idx}`, platform: 'X', author: p.author || 'IIoT World', reach: String(p.reach || '0'), impressions: String(p.impressions || '0'), link: p.link || '' }));
          }

          // 1. Merge Articles: Keep existing ones, add new ones from Resources
          const mergedArticles = [...existingData.articles];
          resources.articleLinks.forEach(link => {
             if (link.url && !mergedArticles.some(a => a.link === link.url)) {
                 const found = results?.resourcesEnhancement?.articles?.find((r: any) => r.id === link.id);
                 mergedArticles.push({
                     id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                     title: found?.title || link.title || 'New Article',
                     caption: found?.caption || link.caption || '',
                     link: link.url
                 });
             }
          });

          // 2. Merge Video Interviews
          const mergedVideos = [...existingData.videoInterviews];
          resources.youtubeLinks.forEach(link => {
             if (link.url && !mergedVideos.some(v => v.link === link.url)) {
                 const found = results?.resourcesEnhancement?.youtube?.find((r: any) => r.id === link.id);
                 mergedVideos.push({
                     id: `vi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                     type: 'interview',
                     title: found?.title || link.title || 'New Video Interview',
                     link: link.url
                 });
             }
          });

          // 3. Merge Graphics (Append new uploads only if they aren't already there)
          // Use file name as label (user can rename in assets step now)
          const newGraphics = uploadedFiles
              .filter(f => f.section === 'graphics' && f.mimeType.startsWith('image'))
              .map(f => ({ url: `data:${f.mimeType};base64,${f.data}`, label: f.name })); // f.name is now editable
          
          const mergedGraphics = [...existingData.graphics];
          newGraphics.forEach(ng => {
              if (!mergedGraphics.some(eg => eg.label === ng.label)) {
                  mergedGraphics.push(ng);
              }
          });

          // 4. Merge Video Collateral
          const newCollateral = uploadedFiles
              .filter(f => f.section === 'collateral' && f.mimeType.startsWith('video/'))
              .map((f, idx) => ({
                  id: `vc-new-${Date.now()}-${idx}`,
                  type: 'collateral' as const,
                  title: f.name, // f.name is now editable
                  link: resources.visualsDriveLink,
                  base64Video: `data:${f.mimeType};base64,${f.data}`,
                  linkedinLink: '',
                  xLink: ''
              }));
          const mergedCollateral = [...existingData.videoCollateral];
          newCollateral.forEach(nc => {
              if (!mergedCollateral.some(ec => ec.title === nc.title)) {
                  mergedCollateral.push(nc);
              }
          });

          // 5. Merge Newsletter Inserts
          // FIX: Force ALL uploaded inserts into IIoT Inserts to consolidate and avoid duplicates in standard list
          const existingIiotInserts = [...(existingData.iiotNewsletterInserts || [])];

          const newInserts = uploadedFiles
              .filter(f => f.section === 'newsletter_inserts')
              .map((f, idx) => ({ 
                  id: `ni-${Date.now()}-${idx}`, 
                  image: `data:${f.mimeType};base64,${f.data}`, 
                  title: f.name 
              }));

          newInserts.forEach(ni => {
              if (!existingIiotInserts.some(ei => ei.title === ni.title)) {
                  existingIiotInserts.push(ni);
              }
          });

          newReportData = {
              ...existingData,
              metadata: metadata, // Update metadata in case it changed
              resources: resources, // Update resources
              linkedinMetrics: freshLiMetrics, // UPDATED
              topLinkedinPosts: freshLiTopPosts, // UPDATED
              allLinkedinPosts: freshLiAllPosts, // UPDATED
              linkedinNewsletters: freshLiNewsletters, // UPDATED
              xMetrics: freshXMetrics, // UPDATED
              topXPosts: freshXTopPosts, // UPDATED
              articles: mergedArticles,
              videoInterviews: mergedVideos,
              graphics: mergedGraphics,
              videoCollateral: mergedCollateral,
              newsletterInserts: [], // Clear standard inserts
              iiotNewsletterInserts: existingIiotInserts,
          };

      } else {
          // --- FULL GENERATION (First Run) ---
          const linkedinNewsletters = liDataBuffer?.newsletterAnalysis?.articles || [];
          const linkedinStandardPosts = liDataBuffer?.postDetailTable?.filter((p: any) => !linkedinNewsletters.some((n: any) => n.link === p.link)) || [];
          const topXPostsRaw = xDataBuffer?.topXPosts || [];
          const topLinkedinPostsRaw = liDataBuffer?.top4Posts || [];

          const enhancedYoutube = resources.youtubeLinks.map(link => {
            const found = results?.resourcesEnhancement?.youtube?.find((r: any) => r.id === link.id);
            return { ...link, title: found?.title || link.title || 'Video Content' };
          });

          const enhancedArticles = resources.articleLinks.map(link => {
            const found = results?.resourcesEnhancement?.articles?.find((r: any) => r.id === link.id);
            return { ...link, title: found?.title || link.title || 'Published Article', caption: found?.caption || link.caption || '' };
          });

          const allDetectedLI = liDataBuffer?.postDetailTable?.map((p: any, idx: number) => ({ 
            ...p, title: p.snippet, id: `ali-${idx}`, platform: 'LinkedIn' as const,
            impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'),
            clicks: String(p.clicks || '0'), comments: String(p.comments || '0'),
            reposts: String(p.reposts || '0'), engagements: String(p.engagements || '0'), reach: '0',
            views: String(p.views || '0')
          })) || [];

          const initialSequence: SlideConfig[] = DEFAULT_SLIDE_IDS.map((id, idx) => ({ id, label: DEFAULT_TITLES[idx], enabled: true }));
          initialSequence.push({ id: 'thank_you', label: 'THANK YOU', enabled: true });

          newReportData = {
            metadata,
            resources: { ...resources, youtubeLinks: enhancedYoutube, articleLinks: enhancedArticles },
            slideTitles: [...DEFAULT_TITLES],
            slideSequence: initialSequence,
            // Added 'views' to default visible columns
            inventoryVisibleColumns: ['date', 'title', 'impressions', 'views', 'engagements', 'reactions', 'clicks', 'reposts', 'link'],
            executiveKpiSelection: ['xReach', 'liImpressions'],
            customExecutiveMetrics: [],
            summaryOfActivities: results?.summaryOfActivities || `Campaign results for ${metadata.clientName}.`,
            activitiesList: (results?.activitiesList || [
              { id: '1', text: `Published Newsletter Articles`, icon: 'DOCS' },
              { id: '2', text: `Shared LinkedIn Updates`, icon: 'SOCIAL' },
              { id: '3', text: `Generated visibility on X platform`, icon: 'GROWTH' }
            ]).map((a: any) => ({ ...a, link: '' })),
            xMetrics: {
              reach: String(xDataBuffer?.xMetrics?.reach || '0'),
              mentions: String(xDataBuffer?.xMetrics?.mentions || '0'),
              impressions: String(xDataBuffer?.xMetrics?.impressions || '0'),
              engagement: String(xDataBuffer?.xMetrics?.engagement || '0'),
              rate: String(xDataBuffer?.xMetrics?.rate || '0%')
            },
            linkedinMetrics: {
              impressions: String(liDataBuffer?.executiveSummary?.totalImpressions || '0'),
              engagement: String(liDataBuffer?.executiveSummary?.totalEngagements || '0'),
              views: String(liDataBuffer?.executiveSummary?.totalViews || '0'),
              totalPosts: String(liDataBuffer?.executiveSummary?.totalPostCount || '0'),
              totalReactions: String(liDataBuffer?.executiveSummary?.reactions || '0'),
              totalComments: String(liDataBuffer?.executiveSummary?.comments || '0'),
              totalClicks: String(liDataBuffer?.executiveSummary?.clicks || '0'),
              totalReposts: String(liDataBuffer?.executiveSummary?.reposts || '0'),
            },
            linkedinNewsletters: linkedinNewsletters.map((p: any, idx: number) => ({ ...p, id: `ln-${idx}`, platform: 'LinkedIn', impressions: String(p.impressions || '0'), reactions: '0', link: p.link || '' })),
            linkedinStandardPosts: linkedinStandardPosts.map((p: any, idx: number) => ({ ...p, id: `ls-${idx}`, platform: 'LinkedIn', impressions: String(p.impressions || '0'), reactions: '0', link: p.link || '' })),
            topXPosts: topXPostsRaw.map((p: any, idx: number) => ({ ...p, id: `tx-${idx}`, platform: 'X', author: p.author || 'IIoT World', reach: String(p.reach || '0'), impressions: String(p.impressions || '0'), link: p.link || '' })),
            topLinkedinPosts: topLinkedinPostsRaw.map((p: any, idx: number) => ({ ...p, id: `tl-${idx}`, platform: 'LinkedIn', impressions: String(p.impressions || '0'), reactions: String(p.reactions || '0'), link: p.link || '' })),
            allLinkedinPosts: allDetectedLI,
            articles: enhancedArticles.filter(l => l.url && l.url.trim() !== '').map((l, idx) => ({ id: `art-${idx}`, title: l.title, link: l.url, caption: l.caption })),
            videoInterviews: enhancedYoutube.filter(l => l.url && l.url.trim() !== '').map((l, idx) => ({ id: `vi-${idx}`, type: 'interview', title: l.title, link: l.url })),
            videoCollateral: uploadedFiles.filter(f => f.section === 'collateral' && f.mimeType.startsWith('video/')).map((f, idx) => ({
                id: `vc-${idx}`, type: 'collateral', title: f.name, link: resources.visualsDriveLink, base64Video: `data:${f.mimeType};base64,${f.data}`, linkedinLink: '', xLink: ''
            })),
            graphics: uploadedFiles.filter(f => f.section === 'graphics' && f.mimeType.startsWith('image')).map(f => ({ url: `data:${f.mimeType};base64,${f.data}`, label: f.name })),
            newsletterInserts: [], // Clear standard list
            iiotNewsletterInserts: uploadedFiles.filter(f => f.section === 'newsletter_inserts').map((f, idx) => ({ id: `ni-${idx}`, image: `data:${f.mimeType};base64,${f.data}`, title: f.name })),
            customSlides: [],
            additionalContent: resources.additionalMedia || ''
          };
      }

      setReportData(newReportData);
      setCurrentStep(ReportStepPreview);
    } catch (error) {
      console.error(error);
      alert("Assembly failed. Please ensure you have generated both LinkedIn and X metrics first.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing, isLIAnalyzing, isXAnalyzing,
    liDataBuffer, xDataBuffer,
    setLiDataBuffer, setXDataBuffer, // Export these
    generateLIMetrics, generateXMetrics, runAnalysis
  };
};
