interface LogoProps {
  className?: string;
  size?: number;
}

// GitWeave 标志：三个节点（红/蓝/绿）通过交织的分支曲线连接，寓意"编织代码分支"
export default function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GitWeave"
    >
      <rect width="48" height="48" rx="11" fill="#0b0b0f" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="10.5" stroke="#1f1f22" />
      {/* 交织的分支曲线 */}
      <path
        d="M14 34 C14 26 34 22 34 14"
        stroke="#1868d6"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M14 14 C14 22 34 26 34 34"
        stroke="#d7244b"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* 节点 */}
      <circle cx="14" cy="14" r="4.5" fill="#d7244b" stroke="#0b0b0f" strokeWidth="2" />
      <circle cx="14" cy="34" r="4.5" fill="#1868d6" stroke="#0b0b0f" strokeWidth="2" />
      <circle cx="34" cy="14" r="4.5" fill="#1868d6" stroke="#0b0b0f" strokeWidth="2" />
      <circle cx="34" cy="34" r="4.5" fill="#10b981" stroke="#0b0b0f" strokeWidth="2" />
      {/* 中心汇聚点 */}
      <circle cx="24" cy="24" r="3.5" fill="#10b981" stroke="#0b0b0f" strokeWidth="2" />
    </svg>
  );
}