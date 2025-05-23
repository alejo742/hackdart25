"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { isUserLoggedIn } from "@/shared/utils/isUserLoggedIn";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    async function checkUserLoggedIn() {
      const userLoggedIn = await isUserLoggedIn();
      if (userLoggedIn) {
        window.location.href = "/dashboard";
      }
    }
    checkUserLoggedIn();
  }, []);

  return (
    <main className={styles.main}>
      <section className={`${styles.hero} fade-animate`}>
        <div>
          <h1 className="text-animate">Experience the craft of survey creation</h1>
        </div>
        <div>
          <p className={`${styles.lead} text-animate`}>
            Easily design your survey in a matter of minutes. Access your audience on all platforms. <br></br>Observe results visually and in real-time.
          </p>
        </div>
        <Link className={`${styles.primaryButton} fade-animate`} href="/login">
          Join now
        </Link>
      </section>

      <section className={styles.points}>
        {/* POINT 1 */}
        <div className={`${styles.pointCard} fade-animate`}>
          <img src="/clicky.png" alt="clicky.png" className={styles.pointImage}/>
          <h2>One Idea. One Click. One Survey.</h2>
          <p>Generate in-depth surveys fast with just a few keywords using our <i>Gemini AI integration!</i></p>
        </div>

        {/* POINT 2 */}
        <div className={`${styles.pointCard} fade-animate`}>
          <img src="/no noise.png" alt="no noise.png" className={styles.pointImage}/>
          <h2>Real Responses. No Noise.</h2>
          <p>Skip the noise. Get only thoughtful, high-quality survey responses — instantly.</p>
        </div>

        {/* POINT 3 */}
        <div className={`${styles.pointCard} fade-animate`}>
          <img src="/globally.png" alt="globally.png" className={styles.pointImage}/>
          <h2>Survey Anyone. Anywhere. Instantly.</h2>
          <p>Administer your surveys campus-wide and country-wide effortlessly.</p>
        </div>
      </section>
    </main>

  )
}