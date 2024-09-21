import { useState } from "react";
import PropType from "prop-types";
import "./index.css";

StarRating.propTypes = {
  maxRating: PropType.number,
};

export default function StarRating({
  maxRating = 5,
  size = "24px",
  color = "#eca918",
  setRating,
}) {
  const [rate, setRate] = useState(null);
  const [tempRate, setTempRate] = useState(0);

  function rating(num) {
    setRate(() => (rate === num ? null : num));
    setRating(() => (rate === num ? null : num));
  }

  function starColor(i) {
    if (tempRate) {
      return i < tempRate ? color : "transparent";
    } else {
      return i < rate ? color : "transparent";
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        // padding: "20px",
        // backgroundColor: "#333",
        width: "fit-content",
        borderRadius: "10px",
        color: "#fff",
        flexDirection: "row",
      }}
    >
      <div style={{ display: "flex" }}>
        {Array.from({ length: maxRating }, (_, i) => {
          return (
            <span
              key={i + 1}
              onClick={() => rating(i + 1)}
              onMouseEnter={() => setTempRate(i + 1)}
              onMouseLeave={() => setTempRate(0)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 20 20"
                fill={starColor(i)}
                stroke={color}
                style={{ cursor: "pointer" }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          );
        })}
      </div>
      <p style={{ margin: "0", minWidth: "20px" }}>
        {tempRate ? tempRate : rate}
      </p>
    </div>
  );
}

/*
FULL STAR

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  fill="#000"
  stroke="#000"
>
  <path
    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
  />
</svg>


EMPTY STAR

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="#000"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="{2}"
    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
  />
</svg>

*/
