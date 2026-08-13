import styles from "./SprintSrtring.module.css";

const PHRASE =
  "ВЕБИНАРЫ / ПОДСКАТЫ / ИНТЕРВЬЮ / КОНФЕРЕНЦИИ / БЕСПЛАТНО / ОНЛАЙН";

export default function SprintSrtring() {
  return (
    <div className={styles.speed__string}>
      <div className={styles.speed__track}>
        <span className={styles.text__speed}>{PHRASE}</span>
        <span className={styles.gap} aria-hidden="true" />
        <span className={styles.text__speed} aria-hidden="true">
          {PHRASE}
        </span>
        <span className={styles.gap} aria-hidden="true" />
      </div>
    </div>
  );
}
