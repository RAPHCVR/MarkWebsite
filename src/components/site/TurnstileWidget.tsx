"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

import { cn } from "@/lib/utils";

type TurnstileSize = "normal" | "compact" | "flexible";
type TurnstileAppearance = "always" | "execute" | "interaction-only";
type TurnstileExecution = "render" | "execute";

type TurnstileWidgetProps = {
  siteKey: string;
  action?: string;
  appearance?: TurnstileAppearance;
  execution?: TurnstileExecution;
  size?: TurnstileSize;
  className?: string;
  inputName?: string;
  onVerify?: (token: string) => void;
  resetSignal?: number;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: TurnstileSize;
      action?: string;
      appearance?: TurnstileAppearance;
      execution?: TurnstileExecution;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove?: (widgetId: string) => void;
  reset?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({
  siteKey,
  action,
  appearance,
  execution,
  size = "normal",
  className,
  inputName = "cf-turnstile-response",
  onVerify,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hasMountedResetEffectRef = useRef(false);
  const [scriptReadyTick, setScriptReadyTick] = useState(0);

  const clearToken = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const renderWidget = useCallback(() => {
    const turnstile = window.turnstile;
    const container = containerRef.current;

    if (!turnstile || !container || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      theme: "light",
      size,
      action,
      appearance,
      execution,
      callback: (token) => {
        if (inputRef.current) {
          inputRef.current.value = token;
        }

        onVerify?.(token);
      },
      "expired-callback": clearToken,
      "error-callback": clearToken,
    });
  }, [action, appearance, clearToken, execution, onVerify, siteKey, size]);

  useEffect(() => {
    let cancelled = false;

    renderWidget();

    const interval = window.setInterval(() => {
      if (cancelled || widgetIdRef.current) {
        window.clearInterval(interval);
        return;
      }

      renderWidget();
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(interval);

      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
      clearToken();
    };
  }, [clearToken, renderWidget, scriptReadyTick]);

  useEffect(() => {
    if (!hasMountedResetEffectRef.current) {
      hasMountedResetEffectRef.current = true;
      return;
    }

    if (!widgetIdRef.current || !window.turnstile?.reset) {
      clearToken();
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    clearToken();
  }, [clearToken, resetSignal]);

  return (
    <>
      <Script
        id="cloudflare-turnstile-explicit"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReadyTick((tick) => tick + 1)}
      />
      <input ref={inputRef} type="hidden" name={inputName} />
      <div
        ref={containerRef}
        className={cn("max-w-full overflow-hidden", className)}
      />
    </>
  );
}
