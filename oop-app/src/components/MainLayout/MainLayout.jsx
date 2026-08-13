// src/components/MainLayout/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import WowInit from "../WowInit/WowInit";
import { SiteContentProvider } from "../../hooks/useSiteContent.js";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  return (
    <SiteContentProvider>
      <div className={styles.layout}>
        <WowInit />
        <main className={styles.layout__main}>
          <div className={styles.layout__content}>
            <Header />
            <div className={styles.layout__outlet}>
              <Outlet />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </SiteContentProvider>
  );
}
