// Simpele, dikke, afgeronde lijniconen. Geen harde hoeken.
type P = { size?: number; filled?: boolean };
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

export const IconBack = ({ size = 24 }: P) => <svg {...base(size)}><path d="M15 5l-7 7 7 7" /></svg>;
export const IconClose = ({ size = 24 }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const IconBookmark = ({ size = 24, filled }: P) => (
  <svg {...base(size)}><path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-4-6 4V5.5a1 1 0 0 1 1-1z" fill={filled ? 'currentColor' : 'none'} /></svg>
);
export const IconShare = ({ size = 24 }: P) => (
  <svg {...base(size)}><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" /><path d="M5 12.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5" /></svg>
);
export const IconCheck = ({ size = 24 }: P) => <svg {...base(size)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const IconSearch = ({ size = 24 }: P) => <svg {...base(size)}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>;
export const IconPost = ({ size = 24 }: P) => (
  <svg {...base(size)}><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="M4.5 7.5l7.5 5.5 7.5-5.5" /></svg>
);
export const IconCalendar = ({ size = 24 }: P) => (
  <svg {...base(size)}><rect x="4" y="5.5" width="16" height="14.5" rx="3" /><path d="M8 3.5v4M16 3.5v4M4.5 10.5h15" /></svg>
);
export const IconBulb = ({ size = 24 }: P) => (
  <svg {...base(size)}><path d="M9 17.5h6M10 20.5h4" /><path d="M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1 1.2-1 2h-5c0-.8-.2-1.4-1-2z" /></svg>
);
export const IconLock = ({ size = 24 }: P) => (
  <svg {...base(size)}><rect x="5" y="10.5" width="14" height="10" rx="3" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>
);
export const IconRepeat = ({ size = 24 }: P) => (
  <svg {...base(size)}><path d="M5 11a7 7 0 0 1 12-4.5L19 8.5M19 4.5v4h-4" /><path d="M19 13a7 7 0 0 1-12 4.5L5 15.5M5 19.5v-4h4" /></svg>
);
export const IconChat = ({ size = 24 }: P) => (
  <svg {...base(size)}><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" /></svg>
);
export const IconLink = ({ size = 24 }: P) => (
  <svg {...base(size)}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
export const IconArrow = ({ size = 24 }: P) => <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
