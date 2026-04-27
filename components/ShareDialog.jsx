'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCopy, faCheck, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faLinkedin, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function ShareDialog({ isOpen, onClose, data, dateStr }) {
  const [copied, setCopied] = useState(false);
  
  if (!data) return null;

  const star = data.primaryStar;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/result?date=${dateStr}`;
  
  // Construct OG image URL for the preview
  const ogParams = new URLSearchParams({
    name: star.name,
    date: dateStr,
    constellation: star.constellation || 'Deep Space',
    distance: star.distance?.lightyears || 'Unknown',
    type: star.spectralType || 'Unknown',
    temp: star.temperature || 'Unknown'
  }).toString();
  
  const ogImageUrl = `${baseUrl}/api/og?${ogParams}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'Twitter/X', icon: faTwitter, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=Discover what the universe found on my day!&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: faFacebook, color: '#4267B2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', icon: faLinkedin, color: '#0077B5', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'WhatsApp', icon: faWhatsapp, color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent('Discover what the universe found on my day: ' + shareUrl)}` }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="share-dialog"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="share-dialog-header">
              <h3>SHARE YOUR DISCOVERY</h3>
              <button onClick={onClose} className="close-btn">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="share-dialog-body">
              {/* Preview Card */}
              <div className="preview-label">WIDE CARD – OPEN GRAPH / FACEBOOK / LINKEDIN</div>
              <div className="og-preview-container">
                <img src={ogImageUrl} alt="Discovery Preview" className="og-preview-img" />
              </div>

              {/* Share Buttons */}
              <div className="share-actions">
                <button className="copy-link-btn" onClick={copyToClipboard}>
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? 'LINK COPIED' : 'COPY EMBED'}
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

              {/* Compact Preview Hint */}
              <div className="preview-label" style={{ marginTop: '2rem' }}>COMPACT – LINK PREVIEW (TWITTER, IMESSAGE, SLACK)</div>
              <div className="compact-preview">
                 <div className="compact-preview-icon" />
                 <div className="compact-preview-text">
                    <div className="compact-preview-title">{star.name}</div>
                    <div className="compact-preview-sub">{dateStr} Discovery</div>
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
