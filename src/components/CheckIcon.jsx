export default function CheckIcon({ className = '', size = 24 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M6.66667 12.2667L10.1333 15.7333L17.3333 8.66667"
        stroke="white"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
