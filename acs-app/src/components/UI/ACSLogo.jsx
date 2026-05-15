export default function ACSLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1a2a4a" stroke="#f06623" strokeWidth="3"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
      {/* ACS text */}
      <text x="50" y="48" textAnchor="middle" fill="#f06623" fontSize="22" fontWeight="bold" fontFamily="Arial,sans-serif">ACS</text>
      {/* Curved top text */}
      <path id="topArc" d="M 15 50 A 35 35 0 0 1 85 50" fill="none"/>
      <text fontSize="7" fill="#e8edf4" fontFamily="Arial,sans-serif" letterSpacing="1">
        <textPath href="#topArc" startOffset="10%">ADVANCED COMPUTER SYSTEM</textPath>
      </text>
      {/* Curved bottom text */}
      <path id="botArc" d="M 18 55 A 35 35 0 0 0 82 55" fill="none"/>
      <text fontSize="7" fill="#8fa3bc" fontFamily="Arial,sans-serif" letterSpacing="2">
        <textPath href="#botArc" startOffset="22%">BURDWAN · 1995</textPath>
      </text>
    </svg>
  )
}
