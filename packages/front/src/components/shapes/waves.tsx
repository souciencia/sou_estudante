// Thanks to Arjun Gautam
export const WavesShape = () => {
  return (
    <svg
      className="relative w-full h-[40px] min-h-[40px] md:h-[15vh] md:min-h-[100px] md:max-h-[150px] -mb-[7px]"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      shapeRendering="auto"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        />
      </defs>
      <g className="parallax">
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="0"
          fill="hsla(186, 83%, 90%, 1)"
          className="animate-[move-forever_12s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite_-2s]"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="3"
          fill="hsla(186, 83%, 80%, 1)"
          className="animate-[move-forever_18s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite_-3s]"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="5"
          fill="hsla(186, 83%, 70%, 1)"
          className="animate-[move-forever_25s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite_-4s]"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="7"
          fill="hsla(186, 83%, 60%, 1)"
          className="animate-[move-forever_40s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite_-5s]"
        />
      </g>
    </svg>
  )
}
