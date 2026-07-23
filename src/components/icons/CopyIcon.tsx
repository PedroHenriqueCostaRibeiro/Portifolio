/** Two overlapping rectangles — a small copy icon. */
export default function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="1.5"
        y="1.5"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}
