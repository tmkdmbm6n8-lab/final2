import { BotWidget } from "./bot-widget";
import { useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Phone,
  Check,
  ShieldCheck,
  Leaf,
  House,
  Sparkles,
  HeartHandshake,
  ScanLine,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessQuery } from "@/lib/business-query";
import { telephone } from "@/lib/business";
import { ServicesGrid, FaqList, Process } from "./shared";
import { reviewsQuery } from "./reviews";

function ReviewTicker() {
  const { data: reviews } = useSuspenseQuery(reviewsQuery);

  if (reviews.length === 0) return null;

  const entries = [...reviews, ...reviews, ...reviews];

  return (
    <section className="review-ticker" aria-label="Avis clients publiés sur le site TClean">
      <div className="review-ticker-label">
        <Star size={15} fill="currentColor" />
        Avis clients TClean
      </div>

      <div className="review-ticker-window">
        <div className="review-ticker-track">
          {entries.map((review, index) => (
            <article className="review-ticker-card" key={`${review.id}-${index}`} aria-hidden={index >= reviews.length}>
              <span className="review-ticker-stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
              <span className="review-ticker-author">{review.author}</span>
              {review.comment && <span className="review-ticker-comment">« {review.comment} »</span>}
            </article>
          ))}
        </div>
      </div>

      <Link to="/avis" className="review-ticker-link">
        Voir tous les avis
      </Link>
    </section>
  );
}

function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    tryPlay();
    const onTouch = () => {
      tryPlay();
      window.removeEventListener("touchstart", onTouch);
    };
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => window.removeEventListener("touchstart", onTouch);
  }, []);

  return (
    <video
      ref={ref}
      className="hero-background-video"
      src="https://videos.pexels.com/video-files/4201911/4201911-hd_1920_1080_25fps.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}

export function Home() {
  const { data: config } = useSuspenseQuery(businessQuery);
  const title = config.heroTitle;

  return (
    <>
      <section className="hero">
        <HeroVideo />

        <div className="container-main hero-content fade-in">
          <div className="hero-eyebrow">
            <span>
              <Sparkles size={14} />
            </span>
            {config.name} · Nettoyage de canapé à {config.city} et environs
          </div>

          <h1 className="hero-seo-title">
            {title === "Redonnez une seconde vie à vos canapés." ? (
              <>
                Nettoyage professionnel de canapé
                <br />
                <em>à Strasbourg</em>
                <br />
                et alentours
              </>
            ) : (
              title
            )}
          </h1>

          <p className="hero-subtitle">{config.heroSubtitle}</p>

          <div className="hero-ctas">
            <Button asChild variant="hero" size="lg">
              <Link to="/configurateur">
                Tarifs & Estimation
                <ArrowUpRight />
              </Link>
            </Button>

            <Button asChild variant="heroOutline" size="lg">
              <a href={`tel:${telephone(config)}`}>
                <Phone />
                Appeler le {config.phone}
              </a>
            </Button>
          </div>

          <div className="hero-details">
            <span>
              <Check size={13} />
              Devis gratuit & sans engagement
            </span>
            <span>
              <Check size={13} />
              Intervention à domicile (Strasbourg & alentours)
            </span>
            <span>
              <Check size={13} />
              Produits biodégradables & sans odeur
            </span>
          </div>
        </div>
      </section>

      <ReviewTicker />

      <section className="section section-prestations" aria-labelledby="services-title">
        <div className="container-main">
          <div className="section-header">
            <span className="section-eyebrow">Nos spécialités</span>
            <h2 id="services-title">Nos prestations de nettoyage textile</h2>
            <p>Pour chaque tissu, un protocole précis d’injection-extraction adapté à la fibre de vos meubles.</p>
          </div>

          <ServicesGrid />

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/prestations">
                Découvrir toutes nos prestations
                <ArrowUpRight className="ml-1" size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Process />

      <section className="section bg-card" aria-labelledby="commitments-title">
        <div className="container-main">
          <div className="section-header">
            <span className="section-eyebrow">Pourquoi TClean</span>
            <h2 id="commitments-title">Notre engagement pour votre intérieur</h2>
            <p>
              Un nettoyage soigné, sans promesses intenables, avec le matériel professionnel d’injection-extraction.
            </p>
          </div>

          <div className="grid-features">
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <House size={20} />
              </div>
              <h3>À domicile à Strasbourg</h3>
              <p>
                Nous nous déplaçons directement chez vous avec tout le matériel nécessaire pour un résultat impeccable.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <ShieldCheck size={20} />
              </div>
              <h3>Respect des fibres</h3>
              <p>
                Chaque tissu est testé avant l’application pour préserver sa texture, ses coutures et ses teintes
                d’origine.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Leaf size={20} />
              </div>
              <h3>Solutions professionnelles</h3>
              <p>
                Détachants certifiés, neutralisation des acariens et bactéries sans résidus agressifs pour vos enfants
                et animaux.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <HeartHandshake size={20} />
              </div>
              <h3>Tarification claire</h3>
              <p>
                Aucune mauvaise surprise : nos tarifs sont annoncés avant intervention et calculés selon le type de
                meuble.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <ScanLine size={20} />
              </div>
              <h3>Diagnostic personnalisé</h3>
              <p>Évaluation de l’état d’usure et des taches pour déterminer la méthode la plus efficace.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Sparkles size={20} />
              </div>
              <h3>Séchage rapide</h3>
              <p>
                Aspiration puissante pour extraire jusqu’à 90 % de l’humidité, permettant une réutilisation sous
                quelques heures.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-home-title">
        <div className="container-main max-w-3xl">
          <div className="section-header text-center">
            <span className="section-eyebrow">Vos questions</span>
            <h2 id="faq-home-title">Questions fréquentes sur le nettoyage de canapé</h2>
            <p>Tout ce qu’il faut savoir sur le temps de séchage, le détachage et le déroulement de notre visite.</p>
          </div>

          <FaqList />

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/faq">
                Consulter toute la FAQ
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section section-cta-banner">
        <div className="container-main cta-banner-inner">
          <div className="cta-banner-text">
            <h2>Prêt à retrouver un canapé propre et frais ?</h2>
            <p>
              Estimez le prix de votre nettoyage en 2 minutes ou contactez-nous directement pour une date
              d’intervention.
            </p>
          </div>
          <div className="cta-banner-actions">
            <Button asChild size="lg" variant="default">
              <Link to="/configurateur">
                Calculer mon tarif
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
      <BotWidget />
    </>
  );
}
