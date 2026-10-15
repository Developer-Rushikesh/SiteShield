import React, { useEffect, useState } from 'react';
import './LogoLoader.css';
import logoImg from '../../images/logo.png';

export const LogoLoader = ({ onFinish, minDuration = 2200 }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fadeTimeout = setTimeout(
      () => {
        setIsFading(true);
      },
      prefersReducedMotion ? 400 : minDuration - 450
    );

    const finishTimeout = setTimeout(
      () => {
        if (onFinish) onFinish();
      },
      prefersReducedMotion ? 600 : minDuration
    );

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(finishTimeout);
    };
  }, [minDuration, onFinish]);

  return (
    <div
      className={`siteshield-loader-overlay ${isFading ? 'fade-out' : ''}`}
      role="progressbar"
      aria-label="Loading SiteShield"
    >
      {/* Background Cyber Radar & Glow Aura */}
      <div className="loader-ambient-aura" />
      <div className="loader-cyber-ring" />
      <div className="loader-cyber-ring-inner" />

      {/* Center 4-Part Logo Assembly Stage */}
      <div className="loader-stage">
        {/* 1. Top slice converges downward */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          className="logo-slice logo-slice-top"
        />

        {/* 2. Bottom slice converges upward */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          className="logo-slice logo-slice-bottom"
        />

        {/* 3. Left slice converges rightward */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          className="logo-slice logo-slice-left"
        />

        {/* 4. Right slice converges leftward */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          className="logo-slice logo-slice-right"
        />

        {/* Complete Assembled Logo with Cyber Glow & Pulse */}
        <img
          src={logoImg}
          alt="SiteShield Logo"
          className="logo-complete"
        />

        {/* Highlight Sweep Gleam */}
        <div
          className="logo-highlight-sweep"
          style={{
            WebkitMaskImage: `url(${logoImg})`,
            maskImage: `url(${logoImg})`
          }}
        />
      </div>

      {/* Brand Typography & Progress Bar */}
      <div className="loader-content">
        <h1 className="loader-brand-title">SiteShield</h1>
        <p className="loader-brand-subtitle">Securing your digital world…</p>

        <div className="loader-progress-track">
          <div className="loader-progress-fill" />
        </div>
      </div>
    </div>
  );
};

export default LogoLoader;
