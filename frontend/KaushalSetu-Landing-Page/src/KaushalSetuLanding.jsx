import React, { useEffect, useRef, useState } from "react";
import logo from "./assets/kaushalsetu-logo.png";
import "./kaushalsetu-landing.css";

const Arrow = ({ down = false }) => (
  <svg
    className={`ks-arrow ${down ? "ks-arrow--down" : ""}`}
    viewBox="0 0 18 18"
    aria-hidden="true"
  >
    <path d="M3 9h11M9.5 4.5 14 9l-4.5 4.5" />
  </svg>
);

const Check = () => (
  <svg className="ks-check" viewBox="0 0 20 20" aria-hidden="true">
    <path d="m5 10.5 3.1 3.1L15.5 6" />
  </svg>
);

const Node = ({ className = "", children }) => (
  <span className={`ks-node ${className}`}>{children}</span>
);

function Reveal({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.14 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`ks-reveal ${className}`}>
      {children}
    </div>
  );
}

function SkillConstellation() {
  return (
    <div className="ks-constellation" aria-hidden="true">
      <svg className="ks-constellation__lines" viewBox="0 0 900 520">
        <path d="M180 140 C280 80 315 185 405 245" />
        <path d="M180 380 C280 430 330 310 405 275" />
        <path d="M405 260 C500 185 590 175 675 125" />
        <path d="M405 275 C510 315 595 350 720 345" />
        <path d="M675 125 C735 175 735 270 720 345" />
      </svg>

      <div className="ks-constellation__center">
        <span className="ks-eyebrow">CAREER PATH</span>
        <strong>Software Developer</strong>
        <span>Readiness 82%</span>
      </div>

      <Node className="ks-node--python">Python <Check /></Node>
      <Node className="ks-node--sql">SQL</Node>
      <Node className="ks-node--react">React <span className="ks-progress-dot" /></Node>
      <Node className="ks-node--career">Career</Node>
      <Node className="ks-node--readiness">Readiness</Node>
    </div>
  );
}

function CareerTwin() {
  return (
    <div className="ks-twin">
      <div className="ks-twin__top">
        <div>
          <span className="ks-eyebrow">YOUR CAREER DIGITAL TWIN</span>
          <h3>Software Developer</h3>
        </div>
        <span className="ks-live"><i /> LIVE VIEW</span>
      </div>

      <div className="ks-twin__score">
        <div className="ks-ring">
          <span>82</span>
          <small>%</small>
        </div>
        <div>
          <span className="ks-muted">SKILL MATCH</span>
          <strong>You're on your way.</strong>
          <p>3 skills are holding your next opportunity back.</p>
        </div>
      </div>

      <div className="ks-twin__skills">
        <div className="ks-twin__skill">
          <span><b>Python</b><Check /></span><em className="done">Strong</em>
        </div>
        <div className="ks-twin__skill">
          <span><b>Git</b><Check /></span><em className="done">Strong</em>
        </div>
        <div className="ks-twin__skill">
          <span><b>React</b></span><em className="partial">Build</em>
        </div>
        <div className="ks-twin__skill">
          <span><b>SQL</b></span><em className="missing">Learn</em>
        </div>
      </div>

      <div className="ks-twin__next">
        <span className="ks-muted">NEXT BEST STEP</span>
        <div>
          <strong>Strengthen React + SQL</strong>
          <Arrow />
        </div>
      </div>
    </div>
  );
}

function TraineePaths() {
  return (
    <div className="ks-paths" aria-hidden="true">
      <div className="ks-paths__header">
        <span>TRAINEE JOURNEYS</span>
        <span>DIFFERENT NEEDS · DIFFERENT SUPPORT</span>
      </div>
      <div className="ks-path">
        <div className="ks-avatar">A</div>
        <div className="ks-path__label">Ready</div>
        <div className="ks-path__line"><span /></div>
        <div className="ks-path__goal">Job match</div>
      </div>
      <div className="ks-path">
        <div className="ks-avatar">B</div>
        <div className="ks-path__label">Skill gap</div>
        <div className="ks-path__line ks-path__line--long"><span /></div>
        <div className="ks-path__goal">Targeted training</div>
      </div>
      <div className="ks-path">
        <div className="ks-avatar">C</div>
        <div className="ks-path__label">At risk</div>
        <div className="ks-path__line ks-path__line--short"><span /></div>
        <div className="ks-path__goal">Early support</div>
      </div>
      <div className="ks-paths__footer">
        <span>INSIGHT</span>
        <strong>See where every learner needs support.</strong>
      </div>
    </div>
  );
}

// Sign-in and registration are handled by the platform's shared sign-in page,
// which is served by the API. Passing ?from=<role> preselects the right role
// there, so a visitor who chose a side on this page doesn't have to choose
// again on the next one.
const SIGN_IN_BASE = "http://localhost:8000/";

export default function KaushalSetuLanding({
  onGetStarted,
  onSignIn,
  signInBase = SIGN_IN_BASE,
}) {
  const roleHref = (role, register = false) => {
    const params = new URLSearchParams({ from: role });
    if (register) params.set("register", "1");
    return `${signInBase}?${params.toString()}`;
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Two thresholds, not one: the bar becomes a pill at 56px and only goes
    // back at 24px. With a single threshold, scrolling slowly across it (or a
    // trackpad's momentum wobble) toggles the class repeatedly and the
    // animation restarts mid-flight, which reads as a stutter.
    const ENTER = 56;
    const EXIT = 24;

    let ticking = false;

    const read = () => {
      ticking = false;
      const y = window.scrollY;
      setIsScrolled((wasScrolled) => (wasScrolled ? y > EXIT : y > ENTER));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      // One read per frame, aligned with paint.
      window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="ks-page">
      <nav className={`ks-nav ${isScrolled ? "ks-nav--scrolled" : ""}`} aria-label="Primary navigation">
        {/* Background only — everything that animates lives here, so the
            links and buttons never move horizontally or re-lay-out. */}
        <div className="ks-nav__surface" aria-hidden="true" />

        <div className="ks-nav__inner">
          <button className="ks-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="ks-brand__mark">
              <img src={logo} alt="" />
            </span>
            <span>KaushalSetu</span>
          </button>

          <div className="ks-nav__links">
            <button onClick={() => scrollTo("platform")}>Platform</button>
            <button onClick={() => scrollTo("features")}>The idea</button>
            <button onClick={() => scrollTo("trainee")}>For trainees</button>
            <button onClick={() => scrollTo("centre")}>For training centres</button>
          </div>

          <div className="ks-nav__actions">
            {onSignIn ? (
              <button className="ks-button ks-button--ghost" onClick={onSignIn}>Sign in</button>
            ) : (
              <a className="ks-button ks-button--ghost" href={signInBase}>Sign in</a>
            )}
            <button
              className="ks-button ks-button--dark"
              onClick={onGetStarted || (() => scrollTo("perspectives"))}
            >
              Get started <Arrow />
            </button>
          </div>
        </div>
      </nav>

      <section className="ks-hero" id="platform">
        <div className="ks-hero__atmosphere" aria-hidden="true">
          <div className="ks-orb ks-orb--one" />
          <div className="ks-orb ks-orb--two" />
          <div className="ks-orb ks-orb--three" />
          <div className="ks-hairline ks-hairline--one" />
          <div className="ks-hairline ks-hairline--two" />
        </div>

        <div className="ks-container ks-hero__content">
          <span className="ks-eyebrow ks-eyebrow--blue">CAREER INTELLIGENCE FOR SKILLING</span>
          <h1>Your skills have<br /><span>a destination.</span></h1>
          <p>
            KaushalSetu connects learning, skills and career opportunities
            to help you understand where you stand and what comes next.
          </p>
          <div className="ks-hero__actions">
            <button
              className="ks-button ks-button--dark ks-button--large"
              onClick={onGetStarted || (() => scrollTo("perspectives"))}
            >
              Get started <Arrow />
            </button>
            <button className="ks-button ks-button--light ks-button--large" onClick={() => scrollTo("problem")}>
              See how it works <Arrow down />
            </button>
          </div>
        </div>

        <div className="ks-container">
          <SkillConstellation />
        </div>
      </section>

      <section className="ks-section ks-section--dark ks-problem" id="problem">
        <div className="ks-container ks-problem__grid">
          <Reveal>
            <span className="ks-eyebrow">THE GAP</span>
            <h2>Training is<br /><span>only the beginning.</span></h2>
          </Reveal>
          <Reveal className="ks-problem__copy">
            <p className="ks-lead">A certificate tells you what you completed.</p>
            <p className="ks-display">It doesn't tell you what's next.</p>
            <div className="ks-questions">
              <span>Am I ready?</span>
              <span>What's missing?</span>
              <span>Which job fits me?</span>
              <span>What should I learn next?</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="ks-section ks-reveal-section" id="features">
        <div className="ks-container">
          <Reveal className="ks-center-copy">
            <span className="ks-eyebrow ks-eyebrow--blue">THE KAUSHALSETU IDEA</span>
            <h2>Meet KaushalSetu.</h2>
            <p>A career intelligence platform that turns learning and skill data into a clearer path forward.</p>
          </Reveal>

          <Reveal className="ks-data-flow">
            <div className="ks-flow-item"><span>Learning</span><small>courses · training</small></div>
            <div className="ks-flow-plus">+</div>
            <div className="ks-flow-item"><span>Skills</span><small>what you can do</small></div>
            <div className="ks-flow-plus">+</div>
            <div className="ks-flow-item"><span>Assessments</span><small>what you know</small></div>
            <div className="ks-flow-arrow">→</div>
            <div className="ks-flow-result">
              <span>KAUSHALSETU</span>
              <strong>Your next step</strong>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The fork. Everything above this point is common ground; everything
          below is written for one audience or the other, so nobody has to
          read past claims that aren't addressed to them. */}
      <section className="ks-section ks-users" id="perspectives">
        <div className="ks-container">
          <Reveal className="ks-center-copy">
            <span className="ks-eyebrow ks-eyebrow--blue">TWO PERSPECTIVES</span>
            <h2>One platform.<br /><span>Two perspectives.</span></h2>
          </Reveal>
          <div className="ks-user-grid">
            <Reveal>
              <article className="ks-user-card">
                <div className="ks-user-card__number">01</div>
                <div className="ks-user-card__icon">T</div>
                <span className="ks-eyebrow">TRAINEE</span>
                <h3>Build your career.</h3>
                <p className="ks-user-card__question">Where can my skills take me?</p>
                <p>Understand your skills, discover opportunities and take your next step with confidence.</p>
                <button type="button" className="ks-user-card__link" onClick={() => scrollTo("trainee")}>
                  Learn more <Arrow />
                </button>
              </article>
            </Reveal>
            <Reveal>
              <article className="ks-user-card">
                <div className="ks-user-card__number">02</div>
                <div className="ks-user-card__icon">C</div>
                <span className="ks-eyebrow">TRAINING CENTRE</span>
                <h3>Build better outcomes.</h3>
                <p className="ks-user-card__question">Which learners need help?</p>
                <p>Understand trainee progress, identify gaps and improve placement outcomes.</p>
                <button type="button" className="ks-user-card__link" onClick={() => scrollTo("centre")}>
                  Learn more <Arrow />
                </button>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------- Trainee ---------------------------- */}
      <section className="ks-section ks-section--navy ks-role" id="trainee">
        <div className="ks-container">
          <Reveal className="ks-feature-intro">
            <span className="ks-eyebrow">FOR TRAINEES</span>
            <h2>Know your<br /><span>career path.</span></h2>
            <p>From &ldquo;What should I do next?&rdquo; to a clear, data-driven career path.</p>
          </Reveal>

          <div className="ks-role__body">
            <Reveal className="ks-usp-list">
              {[
                ["Career Digital Twin", "See your current skills, readiness, gaps and career fit in one place."],
                ["Personalised skill gap analysis", "Know exactly which skills you're missing for a target job."],
                ["Career and job matching", "Discover occupations and jobs that fit your current skill profile."],
                ["Next-best action", "Get a recommendation on what to learn or improve next."],
                ["Placement readiness", "Understand your readiness for employment, not just the certificates you hold."],
              ].map(([title, copy], i) => (
                <div className="ks-usp" key={title}>
                  <span className="ks-usp__index">0{i + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal className="ks-role__visual">
              <CareerTwin />
            </Reveal>
          </div>

          <Reveal className="ks-role__cta">
            <div className="ks-role__cta-copy">
              <span className="ks-eyebrow">START AS A TRAINEE</span>
              <strong>Understand yourself. Find your path. Take the next step.</strong>
            </div>
            <div className="ks-role__cta-actions">
              <a className="ks-button ks-button--light" href={roleHref("trainee", true)}>
                Create trainee account <Arrow />
              </a>
              <a className="ks-button ks-button--ghost-light" href={roleHref("trainee")}>
                Sign in
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------ Training centre ------------------------ */}
      <section className="ks-section ks-role ks-role--light" id="centre">
        <div className="ks-container">
          <Reveal className="ks-feature-intro ks-feature-intro--light">
            <span className="ks-eyebrow ks-eyebrow--blue">FOR TRAINING CENTRES</span>
            <h2>Improve<br /><span>learner outcomes.</span></h2>
            <p>From managing training to predicting and improving outcomes.</p>
          </Reveal>

          <div className="ks-role__body ks-role__body--reverse">
            <Reveal className="ks-role__visual">
              <TraineePaths />
            </Reveal>

            <Reveal className="ks-usp-list ks-usp-list--light">
              {[
                ["Learner intelligence", "See every trainee's skill profile, gaps, readiness and progress."],
                ["Early warning system", "Identify trainees at risk of poor placement or employment outcomes."],
                ["Targeted interventions", "Know which skills each learner needs, instead of giving everyone the same training."],
                ["Placement intelligence", "Understand which trainees are job-ready, and where they fit best."],
                ["Outcome tracking", "Move beyond attendance and certificates to measure actual career outcomes."],
              ].map(([title, copy], i) => (
                <div className="ks-usp" key={title}>
                  <span className="ks-usp__index">0{i + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal className="ks-role__cta ks-role__cta--light">
            <div className="ks-role__cta-copy">
              <span className="ks-eyebrow ks-eyebrow--blue">START AS A TRAINING CENTRE</span>
              <strong>Understand learners. Predict risk. Improve outcomes.</strong>
            </div>
            <div className="ks-role__cta-actions">
              <a className="ks-button ks-button--dark" href={roleHref("employer", true)}>
                Create centre account <Arrow />
              </a>
              <a className="ks-button ks-button--light" href={roleHref("employer")}>
                Sign in
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="ks-section ks-how" id="how-it-works">
        <div className="ks-container">
          <Reveal className="ks-center-copy">
            <span className="ks-eyebrow ks-eyebrow--blue">HOW IT WORKS</span>
            <h2>From data<br /><span>to direction.</span></h2>
          </Reveal>
          <div className="ks-how-grid">
            {[
              ["01", "Create your profile"],
              ["02", "Understand your skills"],
              ["03", "Discover your career path"],
              ["04", "Take the next step"],
            ].map(([number, title]) => (
              <Reveal key={number}>
                <div className="ks-how-step">
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <Arrow />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ks-section ks-scale">
        <div className="ks-container ks-scale__inner">
          <Reveal>
            <span className="ks-eyebrow ks-eyebrow--blue">CURRENT PLATFORM DATASET</span>
            <h2>Built to understand<br /><span>careers at scale.</span></h2>
          </Reveal>
          <Reveal className="ks-metrics">
            <div><strong>10,000+</strong><span>Trainees</span></div>
            <div><strong>65</strong><span>Skills</span></div>
            <div><strong>35</strong><span>Occupations</span></div>
            <div><strong>4,000</strong><span>Jobs</span></div>
          </Reveal>
        </div>
      </section>

      <section className="ks-final">
        <div className="ks-final__glow" aria-hidden="true" />
        <div className="ks-container ks-final__content">
          <span className="ks-eyebrow">KAUSHALSETU</span>
          <h2>Your training has<br /><span>a destination.</span></h2>
          <p>Let's find it.</p>
          <div className="ks-final__actions">
            <a className="ks-button ks-button--light ks-button--large" href={roleHref("trainee", true)}>
              I'm a trainee <Arrow />
            </a>
            <a className="ks-button ks-button--ghost-light ks-button--large" href={roleHref("employer", true)}>
              I'm a training centre <Arrow />
            </a>
          </div>
          <p className="ks-final__signin">
            Already registered? <a href={signInBase}>Sign in</a>
          </p>
          <div className="ks-final__tagline">Track the Career. Predict the Outcome. Simulate the Future.</div>
        </div>
      </section>

      <footer className="ks-footer">
        <div className="ks-container ks-footer__inner">
          <div>
            <div className="ks-footer__brand">
              <img src={logo} alt="" />
              KaushalSetu
            </div>
            <p>Track the Career.<br />Predict the Outcome.<br />Simulate the Future.</p>
          </div>
          <div className="ks-footer__links">
            <button onClick={() => scrollTo("platform")}>Platform</button>
            <button onClick={() => scrollTo("features")}>The idea</button>
            <button onClick={() => scrollTo("trainee")}>For trainees</button>
            <button onClick={() => scrollTo("centre")}>For training centres</button>
          </div>
          <div className="ks-footer__links">
            <a href={roleHref("trainee")}>Trainee sign in</a>
            <a href={roleHref("trainee", true)}>Trainee register</a>
            <a href={roleHref("employer")}>Training centre sign in</a>
            <a href={roleHref("employer", true)}>Training centre register</a>
          </div>
        </div>
        <div className="ks-container ks-footer__bottom">© 2026 KaushalSetu</div>
      </footer>
    </main>
  );
}
