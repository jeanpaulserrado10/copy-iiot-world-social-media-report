
import React, { useState, useRef } from 'react';
import { ReportData } from '../types';
import { Icon } from './Icon';
import SlideWrapper from './SlideWrapper';
import StandardSlideRenderer from './slides/StandardSlideRenderer';
import CustomSlideRenderer from './slides/CustomSlideRenderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PresentationViewProps {
  data: ReportData;
  onBackToEdit?: () => void;
  reportId?: string;
}

const PresentationView: React.FC<PresentationViewProps> = ({ data, onBackToEdit, reportId }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'done'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Direct access to data since Case Study masking is now handled at report creation time
  const displayData = data;

  const activeConfigs = (displayData.slideSequence || []).filter((s: any) => s.enabled);
  const safeActiveSlide = Math.min(activeSlide, Math.max(0, activeConfigs.length - 1));
  const currentConfig = activeConfigs[safeActiveSlide];

  const handleShare = async () => {
    setShareStatus('copying');
    
    if (!reportId) {
        alert("Please save the report to the cloud first to generate a shareable link.");
        setShareStatus('idle');
        return;
    }

    try {
      const url = `${window.location.origin}${window.location.pathname}?reportId=${reportId}`;
      await navigator.clipboard.writeText(url);
      setShareStatus('done');
    } catch (e) {
      console.error(e);
      setShareStatus('done');
    }
    setTimeout(() => setShareStatus('idle'), 3000);
  };

  const handleDownloadPdf = async () => {
      if (isGeneratingPdf) return;
      setIsGeneratingPdf(true);
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!pdfContainerRef.current) {
          setIsGeneratingPdf(false);
          return;
      }

      try {
          // Initialize PDF without default format/orientation as we'll set per page
          const doc = new jsPDF({
              unit: 'px',
              hotfixes: ['px_scaling']
          });

          // Remove the initial page created by default
          doc.deletePage(1);

          const slides = Array.from(pdfContainerRef.current.children) as HTMLElement[];
          
          for (let i = 0; i < slides.length; i++) {
              const slideContainer = slides[i];
              // Get the actual content wrapper inside the slide container
              const contentWrapper = slideContainer.firstElementChild as HTMLElement;
              
              if (!contentWrapper) continue;

              // Calculate actual height needed
              // We use scrollHeight to get the full height of content including overflow
              const actualHeight = contentWrapper.scrollHeight;
              const width = 1280;
              // Add a 50px buffer to prevent bottom text cutoff
              const height = Math.max(720, actualHeight + 50); 

              // Capture with dynamic height
              const canvas = await html2canvas(contentWrapper, {
                  scale: 2, // Better quality
                  useCORS: true,
                  logging: false,
                  letterRendering: true, // Helps with text rendering
                  width: width,
                  height: height,
                  windowWidth: width,
                  windowHeight: height,
                  backgroundColor: '#ffffff',
                  onclone: (clonedDoc) => {
                      const elements = clonedDoc.querySelectorAll('*');
                      elements.forEach((el: any) => {
                          if (el.style) {
                              el.style.animation = 'none';
                              el.style.transition = 'none';
                              el.style.boxShadow = 'none'; // Remove shadows which can look weird
                          }
                      });

                      // Force fix button centering
                      const buttons = clonedDoc.querySelectorAll('a[href], button');
                      buttons.forEach((btn: any) => {
                          btn.style.display = 'flex';
                          btn.style.justifyContent = 'center';
                          btn.style.alignItems = 'center';
                          btn.style.textAlign = 'center';
                          btn.style.transform = 'none'; // Remove transforms
                      });
                  }
              });

              const imgData = canvas.toDataURL('image/png');
              
              // Add page with the specific dimensions of this slide
              doc.addPage([width, height], height > width ? 'portrait' : 'landscape');
              doc.addImage(imgData, 'PNG', 0, 0, width, height);

              // --- ADD LINKS ---
              // We need to find clickable elements in the original DOM (contentWrapper)
              // and map their positions to the PDF.
              
              // Helper to add link
              const addLinkToPdf = (element: HTMLElement, url: string) => {
                  const rect = element.getBoundingClientRect();
                  const wrapperRect = contentWrapper.getBoundingClientRect();
                  
                  // Calculate relative position inside the slide
                  const x = rect.left - wrapperRect.left;
                  const y = rect.top - wrapperRect.top;
                  const w = rect.width;
                  const h = rect.height;

                  // Add link to PDF (coordinates are in the same unit as the page, which is 'px' here)
                  doc.link(x, y, w, h, { url });
              };

              // 1. Find <a> tags with href
              const links = contentWrapper.querySelectorAll('a[href]');
              links.forEach((link) => {
                  const href = link.getAttribute('href');
                  if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                      addLinkToPdf(link as HTMLElement, href);
                  }
              });

              // 2. Find buttons that might be links (e.g. "View Full Report")
              // In our app, some buttons use onClick to navigate or window.open. 
              // We can't easily extract the URL from onClick, BUT we can look for specific data attributes 
              // or known button structures if we update the components to expose the URL.
              //
              // STRATEGY: We will look for elements with `data-pdf-link` attribute.
              // This requires updating the slide renderers to add this attribute to clickable buttons.
              const customLinkedButtons = contentWrapper.querySelectorAll('[data-pdf-link]');
              customLinkedButtons.forEach((btn) => {
                  const url = btn.getAttribute('data-pdf-link');
                  if (url) {
                      addLinkToPdf(btn as HTMLElement, url);
                  }
              });
          }

          doc.save(`${displayData.metadata.campaignName || 'Report'}.pdf`);

      } catch (error) {
          console.error("PDF Generation Error:", error);
          alert("Error generating PDF. Please try again.");
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  const goToSlide = (slideId: string) => {
    const idx = activeConfigs.findIndex((s: any) => s.id === slideId);
    if (idx >= 0) {
        setActiveSlide(idx);
    }
  };

  const renderSlideContent = (slideId: string) => {
    // Check if it's a custom slide first
    const custom = (displayData.customSlides || []).find((s: any) => s.id === slideId);
    if (custom) {
        return <CustomSlideRenderer custom={custom} />;
    }
    // Fallback to standard slide
    return <StandardSlideRenderer slideId={slideId} data={displayData} goToSlide={goToSlide} />;
  };

  if (!currentConfig) return null;

  const isFinalSlide = currentConfig?.id === 'thank_you';

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-full animate-fadeIn">
      {/* PDF Generation Container - Hidden from view but rendered for capture */}
      {isGeneratingPdf && (
        <div 
            ref={pdfContainerRef} 
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: '-10000px', 
                width: '1280px', 
                zIndex: -1000, 
            }}
        >
            {activeConfigs.map((config: any, idx: number) => (
                <div key={config.id} style={{ width: '1280px', minHeight: '720px', height: 'auto', overflow: 'visible', background: 'white' }}>
                    <SlideWrapper 
                        title={config.id === 'thank_you' ? undefined : config.label} 
                        noContainer={config.id === 'thank_you'}
                        activeSlide={idx}
                        totalSlides={activeConfigs.length}
                        clientName={displayData.metadata.clientName}
                        campaignName={displayData.metadata.campaignName}
                        activeConfigs={activeConfigs}
                        isPdf={true}
                    >
                        {renderSlideContent(config.id)}
                    </SlideWrapper>
                </div>
            ))}
        </div>
      )}

      {/* Print View - Keeping for fallback or if user still wants browser print */}
      <div className="hidden print:block w-full">
         <div className="print-content-container">
            {activeConfigs.map((config: any, idx: number) => (
               <div key={config.id} className="print-page-break">
                  <SlideWrapper 
                    title={config.id === 'thank_you' ? undefined : config.label} 
                    noContainer={config.id === 'thank_you'}
                    activeSlide={idx}
                    totalSlides={activeConfigs.length}
                    clientName={displayData.metadata.clientName}
                    campaignName={displayData.metadata.campaignName}
                    activeConfigs={activeConfigs}
                    isPrint={true}
                  >
                     {renderSlideContent(config.id)}
                  </SlideWrapper>
               </div>
            ))}
         </div>
      </div>

      {/* Screen View */}
      <div className="lg:w-3/4 h-full print:hidden flex items-center justify-center">
        <SlideWrapper 
          title={isFinalSlide ? undefined : currentConfig?.label} 
          noContainer={isFinalSlide}
          activeSlide={safeActiveSlide}
          totalSlides={activeConfigs.length}
          onDotClick={setActiveSlide}
          clientName={displayData.metadata.clientName}
          campaignName={displayData.metadata.campaignName}
          activeConfigs={activeConfigs}
        >
          <div className="animate-slideUp h-full flex flex-col">
             {renderSlideContent(currentConfig.id)}
          </div>
        </SlideWrapper>
      </div>
      <div className="lg:w-1/4 h-full print:hidden">
         <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
            <h3 className="text-sm font-black text-[#283b82] uppercase mb-8 pb-4 border-b">Report Navigator</h3>
            
            <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
               {activeConfigs.map((config: any, i: number) => (
                 <button key={config.id} onClick={() => setActiveSlide(i)} className={`w-full text-left px-5 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${safeActiveSlide === i ? 'bg-[#283b82] text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'}`}>{config.label}</button>
               ))}
            </div>
            <div className="mt-8 space-y-4">
              <button onClick={handleShare} className={`w-full py-4 border-2 ${shareStatus === 'done' ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-500'} font-black rounded-3xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2`}>
                <Icon type={shareStatus === 'done' ? 'STAR' : 'SHARE'} className="w-4 h-4" /> {shareStatus === 'copying' ? 'Generating...' : shareStatus === 'done' ? 'Link Copied!' : 'Website Mode Link'}
              </button>

              {onBackToEdit && (
                <>
                  <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className={`w-full py-4 border-2 ${isGeneratingPdf ? 'bg-gray-50 border-gray-200 text-gray-400' : 'border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-500'} font-black rounded-3xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2`}>
                    <Icon type="DOWNLOAD" className="w-4 h-4" /> {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                  </button>

                  <button onClick={onBackToEdit} className="w-full py-4 border-2 border-gray-100 text-gray-400 hover:text-iiot-blue hover:border-iiot-blue/30 font-black rounded-3xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Icon type="EDIT" className="w-3.5 h-3.5" /> Edit Report Details
                  </button>
                </>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PresentationView;
