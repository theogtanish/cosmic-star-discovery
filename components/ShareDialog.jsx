'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function ShareDialog({ isOpen, onClose, data, dateStr }) {
  const [copied, setCopied] = useState(false);
  
  if (!data) return null;

  const star = data.primaryStar;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cosmic-star-discovery.vercel.app';
  const shareUrl = `${baseUrl}/result?date=${dateStr}`;
  const apodUrl = data.apodImage?.url || 'https://apod.nasa.gov/apod/image/0001/deepfield_hst_big.jpg';
  
  // Construct OG image URL
  const ogParams = new URLSearchParams({
    name: star.name,
    date: dateStr,
    constellation: star.constellation || 'Deep Space',
    distance: star.distance?.lightyears || 'Unknown',
    img: apodUrl
  }).toString();
  
  const ogImageUrl = `${baseUrl}/api/og?${ogParams}`;

  // User's requested HTML Embed snippet
  const embedCode = `<a href="${shareUrl}" style="display:inline-flex;align-items:center;gap:12px;background:#050810;border-radius:12px;padding:12px 16px;text-decoration:none;width:100%;max-width:340px;overflow:hidden;position:relative;box-sizing:border-box;"><img src="${apodUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;" /><div style="width:44px;height:44px;border-radius:50%;border:1px solid rgba(201,168,76,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:1;"><span style="color:#c9a84c;font-size:20px;">✦</span></div><div style="position:relative;z-index:1;"><div style="font-family:serif;font-style:italic;color:#c9a84c;font-size:1.2rem;">${star.name}</div><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;">${dateStr} Discovery</div></div></a>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'Twitter/X', icon: faTwitter, color: '#000000', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Discover what the universe found on my day! ${star.name} via`)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Instagram', icon: faInstagram, color: '#E1306C', url: `https://www.instagram.com/` }, // Instagram doesn't have a direct share URL like others, usually link in bio or stories
    { name: 'WhatsApp', icon: faWhatsapp, color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(`Discover what the universe found on my day: ${star.name} — ${shareUrl}`)}` }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="share-dialog"
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
          >
            <div className="share-dialog-header">
              <h3>SHARE YOUR DISCOVERY</h3>
              <button onClick={onClose} className="close-btn">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="share-dialog-body">
              <div className="preview-label">SOCIAL CARD PREVIEW</div>
              <div className="og-preview-container">
                <img src={ogImageUrl} alt="Discovery Preview" className="og-preview-img" />
              </div>

              <div className="share-actions">
                <button className="copy-link-btn" onClick={copyEmbed} style={{ background: copied ? 'rgba(201,168,76,0.1)' : 'transparent' }}>
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? 'EMBED COPIED' : 'COPY HTML EMBED'}
                </button>
                
                <div className="social-grid">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.name} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-btn"
                    >
                      <FontAwesomeIcon icon={social.icon} />
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="preview-label" style={{ marginTop: '2rem' }}>COMPACT PREVIEW</div>
              <div dangerouslySetInnerHTML={{ __html: embedCode }} style={{ pointerEvents: 'none' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
