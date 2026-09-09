import React from 'react';

/**
 * Illustrations vectorielles SVG originales pour la Landing Page.
 * Style institutionnel : traits fins (stroke-width 1.5 - 2), palette limitée (brand-600, emerald-500, slate-700/300).
 */

export const DepositIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Background soft grid & card */}
    <rect x="30" y="20" width="220" height="160" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M50 40H130" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 55H100" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

    {/* Form Field Mockups */}
    <rect x="50" y="75" width="180" height="24" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
    <circle cx="62" cy="87" r="4" fill="#026FC3" />
    <path d="M74 87H150" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

    <rect x="50" y="110" width="180" height="24" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
    <circle cx="62" cy="122" r="4" fill="#10B981" />
    <path d="M74 122H135" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

    {/* Floating Document with Badge */}
    <g transform="translate(170, 70)">
      <rect width="80" height="100" rx="10" fill="#FFFFFF" stroke="#026FC3" strokeWidth="1.8" className="shadow-lg" />
      <path d="M15 25H65" stroke="#026FC3" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 38H55" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 50H60" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 62H45" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      {/* Mini Seal */}
      <circle cx="55" cy="78" r="10" fill="#E0EFFE" stroke="#026FC3" strokeWidth="1.5" />
      <path d="M51 78L54 81L60 74" stroke="#026FC3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export const OcrScanIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Base Scanner Tablet Frame */}
    <rect x="35" y="15" width="210" height="170" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    
    {/* Document within scanner */}
    <rect x="55" y="32" width="170" height="136" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="4 4" />
    
    {/* Document Text Lines */}
    <path d="M75 52H145" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75 68H185" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M75 80H160" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M75 92H195" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Extracted Metadata tags */}
    <rect x="75" y="112" width="62" height="18" rx="4" fill="#EFF6FF" stroke="#38BDF8" strokeWidth="1" />
    <text x="82" y="124" fontSize="8" fontFamily="Inter, sans-serif" fill="#026FC3" fontWeight="bold">IBAN VALIDÉ</text>

    <rect x="145" y="112" width="60" height="18" rx="4" fill="#ECFDF5" stroke="#34D399" strokeWidth="1" />
    <text x="152" y="124" fontSize="8" fontFamily="Inter, sans-serif" fill="#059669" fontWeight="bold">ICE CONFORME</text>

    {/* Dynamic Laser Scanning Beam with Glow */}
    <line x1="45" y1="88" x2="235" y2="88" stroke="#026FC3" strokeWidth="2.5" strokeLinecap="round" />
    <polygon points="45,88 235,88 220,104 60,104" fill="url(#laserGradient)" opacity="0.4" />

    {/* Top Right Secure CPU Chip */}
    <g transform="translate(195, 22)">
      <rect width="32" height="32" rx="6" fill="#0F172A" />
      <circle cx="16" cy="16" r="6" fill="#10B981" />
      <path d="M16 6V10M16 22V26M6 16H10M22 16H26" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    <defs>
      <linearGradient id="laserGradient" x1="140" y1="88" x2="140" y2="104" gradientUnits="userSpaceOnUse">
        <stop stopColor="#026FC3" />
        <stop offset="1" stopColor="#026FC3" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export const TrackingIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Background Timeline Card */}
    <rect x="30" y="20" width="220" height="160" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

    {/* Header bar */}
    <path d="M50 42H120" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    <rect x="180" y="34" width="50" height="16" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
    <text x="189" y="45" fontSize="7" fontFamily="Inter, sans-serif" fill="#047857" fontWeight="bold">EN COURS</text>

    {/* Timeline Vertical Track */}
    <line x1="65" y1="68" x2="65" y2="152" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />

    {/* Step 1 : Validated */}
    <circle cx="65" cy="72" r="9" fill="#10B981" />
    <path d="M62 72L64 74L68 69" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M85 70H170" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    <path d="M85 78H130" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />

    {/* Step 2 : Active Pulsing */}
    <circle cx="65" cy="112" r="12" fill="#E0EFFE" stroke="#026FC3" strokeWidth="1.5" />
    <circle cx="65" cy="112" r="5" fill="#026FC3" />
    <path d="M85 109H195" stroke="#026FC3" strokeWidth="2" strokeLinecap="round" />
    <path d="M85 118H155" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />

    {/* Step 3 : Upcoming */}
    <circle cx="65" cy="148" r="7" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
    <path d="M85 146H160" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
