// Strips the document skeleton from the single-file build so it can be published as a hosted preview page.
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('dist-preview/index.html', 'utf8')
const out = src
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?(html|head|body)[^>]*>/gi, '')
  .replace(/<meta (charset|name="viewport")[^>]*>/gi, '')
writeFileSync('dist-preview/aspen-cleaners.html', out.trim() + '\n')
console.log('wrote dist-preview/aspen-cleaners.html', (out.length / 1e6).toFixed(2), 'MB')
