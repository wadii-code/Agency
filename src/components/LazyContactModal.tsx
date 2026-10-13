"use client";

import dynamic from "next/dynamic";

/**
 * The contact popup and its validation (zod) live in their own chunk, loaded
 * once the page is interactive, so they never weigh on the first load.
 */
const LazyContactModal = dynamic(() => import("./ContactModal"), { ssr: false });

export default LazyContactModal;
