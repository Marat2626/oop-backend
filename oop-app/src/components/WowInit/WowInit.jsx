import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import WOW from "wow.js";

const wowOptions = {
  boxClass: "wow",
  animateClass: "animate__animated",
  offset: 80,
  mobile: true,
  live: true,
};

export default function WowInit() {
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const wow = new WOW(wowOptions);
      wow.init();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
