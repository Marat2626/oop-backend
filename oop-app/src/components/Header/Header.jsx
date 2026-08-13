import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { useSiteContent } from "../../hooks/useSiteContent.js";
import { QUESTION_URL } from "../../constants/externalLinks.js";

const HERO_ROUTES = new Set(["/", "/about"]);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 8,
  );
  const { pathname } = useLocation();
  const solidHeader = scrolled || menuOpen || !HERO_ROUTES.has(pathname);
  const { content, logoPrimary, logoSecondary, navLinks } = useSiteContent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const handleNavClick = () => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  };

  return (
    <div
      className={`${styles.container__header} ${
        solidHeader
          ? styles.container__header_solid
          : styles.container__header_clear
      }`}
    >
      <div className="container">
        <div className={styles.header}>
          <Link
            to="/"
            className={styles.logo__container}
            onClick={handleNavClick}
            aria-label="На главную"
          >
            <img className={styles.logo1} src={logoPrimary} alt="Logo" />
            <img className={styles.logo} src={logoSecondary} alt="Logo 1" />
          </Link>

          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                className={styles.nav_color}
                to={link.to}
                onClick={handleNavClick}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <a
            href={QUESTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.questionBtn}
          >
            {content.nav.question_cta}
          </a>

          <button
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenu_open : ""}`}
      >
        <nav className={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              className={styles.mobileNav__link}
              to={link.to}
              onClick={handleNavClick}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={QUESTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileNav__question}
            onClick={() => setMenuOpen(false)}
          >
            {content.nav.question_cta}
          </a>
        </nav>
      </div>
    </div>
  );
}
