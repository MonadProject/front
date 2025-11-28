import { memo } from "react";

function NeonGavel({ width = 500, height = 500, className, style }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      className={className}
      style={style}
    >
      <style>
        {`
          .gavel { 
            transform: translate(-30px, -100px) rotate(-35deg);
            transform-origin: 280px 230px;
            transform-box: fill-box;
            animation: gavelStrike 4s ease-in-out infinite;
          }
          @keyframes gavelStrike {
            0%, 70% { 
              transform: translate(-30px, -100px) rotate(-35deg); 
            }
            75% { 
              transform: translate(-30px, -70px) rotate(-30deg); 
            }
            80% { 
              transform: translate(-30px, -30px) rotate(-5deg); 
            }
            82% { 
              transform: translate(-30px, -50px) rotate(-15deg); 
            }
            85% { 
              transform: translate(-30px, -35px) rotate(-8deg); 
            }
            88% { 
              transform: translate(-30px, -45px) rotate(-12deg); 
            }
            92% { 
              transform: translate(-30px, -100px) rotate(-35deg); 
            }
            100% { 
              transform: translate(-30px, -100px) rotate(-35deg); 
            }
          }
          .baseTop { 
            animation: baseBounce 4s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: 250px 345px;
          }
          @keyframes baseBounce {
            0%, 70% { transform: scaleY(1); }
            80% { transform: scaleY(0.88); }
            82% { transform: scaleY(0.95); }
            85% { transform: scaleY(0.92); }
            88% { transform: scaleY(0.96); }
            92% { transform: scaleY(1); }
            100% { transform: scaleY(1); }
          }
          .impactRing {
            animation: impactPulse 4s ease-out infinite;
            transform-origin: 220px 340px;
          }
          @keyframes impactPulse {
            0%, 70%, 100% { 
              opacity: 0;
              transform: scale(0.8);
            }
            80% { 
              opacity: 0.8;
              transform: scale(1.3);
            }
            85% { 
              opacity: 0;
              transform: scale(1.6);
            }
          }
        `}
      </style>
      <defs>
        <linearGradient id="gavelGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FACFE" />
          <stop offset="100%" stopColor="#00F2FE" />
        </linearGradient>
        <linearGradient id="gavelGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B7FFF" />
          <stop offset="100%" stopColor="#3B5FDD" />
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow rings */}
      <circle
        cx="250"
        cy="250"
        r="200"
        fill="none"
        stroke="url(#gavelGrad1)"
        strokeWidth="1"
        opacity="0.2"
      />
      <circle
        cx="250"
        cy="250"
        r="220"
        fill="none"
        stroke="url(#gavelGrad1)"
        strokeWidth="1"
        opacity="0.15"
      />
      <circle
        cx="250"
        cy="250"
        r="240"
        fill="none"
        stroke="url(#gavelGrad1)"
        strokeWidth="1"
        opacity="0.1"
      />

      {/* Base platform glow */}
      <ellipse
        cx="250"
        cy="410"
        rx="120"
        ry="15"
        fill="url(#gavelGrad1)"
        opacity="0.4"
        filter="url(#neonGlow)"
      />

      {/* Pedestal bottom */}
      <ellipse
        cx="250"
        cy="388"
        rx="100"
        ry="12"
        fill="url(#gavelGrad2)"
        opacity="0.8"
      />

      {/* Pedestal side */}
      <path
        d="M 150 390 L 160 350 L 340 350 L 350 390 Z"
        fill="url(#gavelGrad2)"
        opacity="0.6"
        stroke="#5B7FFF"
        strokeWidth="2"
        filter="url(#neonGlow)"
      />

      {/* Pedestal top - animated */}
      <ellipse
        className="baseTop"
        cx="250"
        cy="345"
        rx="90"
        ry="11"
        fill="url(#gavelGrad1)"
        opacity="0.9"
      />

      {/* Impact ring effect */}
      <ellipse
        className="impactRing"
        cx="220"
        cy="340"
        rx="40"
        ry="8"
        fill="none"
        stroke="#00F2FE"
        strokeWidth="3"
      />

      {/* Gavel group */}
      <g className="gavel">
        {/* Handle */}
        <rect
          x="300"
          y="200"
          width="240"
          height="36"
          rx="18"
          fill="url(#gavelGrad2)"
          stroke="#00F2FE"
          strokeWidth="3"
          filter="url(#neonGlow)"
        />

        {/* Handle grip lines */}
        <rect
          x="360"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="380"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="400"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="420"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="440"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="460"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="480"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />
        <rect
          x="500"
          y="202"
          width="6"
          height="32"
          rx="3"
          fill="#00F2FE"
          opacity="0.6"
        />

        {/* Connection joint */}
        <circle
          cx="300"
          cy="210"
          r="24"
          fill="url(#gavelGrad2)"
          stroke="#00F2FE"
          strokeWidth="3"
          filter="url(#neonGlow)"
        />
        <circle cx="300" cy="210" r="14" fill="rgba(255,255,255,0.2)" />

        {/* Gavel head */}
        <rect
          x="220"
          y="160"
          width="160"
          height="100"
          rx="18"
          fill="url(#gavelGrad1)"
          stroke="#00F2FE"
          strokeWidth="4"
          filter="url(#neonGlow)"
          transform="rotate(90 300 210)"
        />
      </g>
    </svg>
  );
}

export default memo(NeonGavel);
