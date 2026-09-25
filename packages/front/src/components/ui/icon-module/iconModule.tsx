import type { Module } from '@/lib/module'

interface IconModuleProps {
  module: Module
}

const icons = {
  '1': (
    <>
      <path
        d="M6.5 1.2V3.9M6.5 9.1V11.8M1.2 6.5H3.9M9.1 6.5H11.8M8.4 4.6L9.5 3.5M8.4 8.4L9.5 9.5M4.6 8.4L3.5 9.5M4.6 4.6L3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6.5" cy="6.5" r="1.3" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  '2': (
    <>
      <circle cx="6.5" cy="6.5" r="5.2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="6.5" y1="1.8" x2="6.5" y2="4.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6.5" y1="6.5" x2="9.2" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" />
    </>
  ),
  '3': (
    <>
      <path
        d="M6.5 1.5V11M6.5 11C6.5 11 3 9.5 3 6.5M6.5 11C6.5 11 10 9.5 10 6.5M4.5 3.5H8.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6.5" cy="2.2" r="1.2" stroke="currentColor" strokeWidth="1.1" />
    </>
  ),
  '4': (
    <>
      <circle cx="5.2" cy="5.2" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      <line
        x1="7.8"
        y1="7.8"
        x2="11.5"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
  '5': (
    <>
      <path
        d="M1.5 10.5L11.5 2.5M3.5 10.5C3.5 7 6 4 9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="2.2" cy="10.8" r="1" fill="currentColor" />
    </>
  ),
};

export default function IconModule({ module }: IconModuleProps) {
  return (
    <svg
      viewBox="0 0 13 13"
      fill="none"
      width="14"
      height="14"
      aria-hidden
    >
      {icons[module]}
    </svg>
  );
}