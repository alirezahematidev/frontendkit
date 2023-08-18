#!/usr/bin/env node

if (!import.meta.url.includes('node_modules')) {
  try {
    await import('source-map-support').then((r) => r.default.install());
  } catch (e) {
    // just make happy compiler
  }
}

import '../dist/cli.js';
