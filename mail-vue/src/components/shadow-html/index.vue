<template>
  <div class="content-box" ref="contentBox">
    <div ref="container" class="content-html"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  html: {
    type: String,
    required: true
  }
})

const container = ref(null)
const contentBox = ref(null)
let shadowRoot = null

function cleanBodyStyle(style) {
  return String(style || '')
    .replace(/(?:^|;)\s*display\s*:\s*none\s*!?\s*;?/gi, ';')
    .replace(/(?:^|;)\s*visibility\s*:\s*hidden\s*!?\s*;?/gi, ';')
    .replace(/(?:^|;)\s*opacity\s*:\s*0\s*!?\s*;?/gi, ';')
    .trim();
}

function sanitizeHtml(html) {
  return String(html || '')
    // Scripts must never be executed in the mail viewer.
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove executable/event-handler attributes while preserving normal mail HTML.
    .replace(/\s+on[a-z]+\s*=\s*(["'])[^"']*\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    // A full mail document may contain html/head/body wrappers. The viewer only
    // needs the document content; style blocks are intentionally preserved so
    // Gmail/Cloudflare/Outlook generated markup keeps its layout.
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<\/?head[^>]*>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '');
}

function updateContent() {
  if (!shadowRoot) return;

  const bodyStyleRegex = /<body[^>]*\sstyle\s*=\s*(["'])([\s\S]*?)\1[^>]*>/i;
  const bodyStyleMatch = String(props.html || '').match(bodyStyleRegex);
  const bodyStyle = cleanBodyStyle(bodyStyleMatch ? bodyStyleMatch[2] : '');
  const cleanedHtml = sanitizeHtml(props.html);

  shadowRoot.innerHTML = `
    <style>
      :host {
        all: initial;
        width: 100%;
        height: 100%;
        font-family: Inter, 'Helvetica Neue', Helvetica, 'PingFang SC',
                    'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #13181D;
        word-break: break-word;
      }

      h1, h2, h3, h4 {
        font-size: 18px;
        font-weight: 700;
      }

      p {
        margin: 0;
      }

      a {
        text-decoration: none;
        color: #0E70DF;
      }

      .shadow-content {
        background: #FFFFFF;
        width: fit-content;
        height: fit-content;
        min-width: 100%;
        ${bodyStyle ? bodyStyle : ''}
      }

      img:not(table img) {
        max-width: 100%;
        height: auto !important;
      }
    </style>
    <div class="shadow-content">
      ${cleanedHtml}
    </div>
  `;
}

function autoScale() {
  if (!shadowRoot || !contentBox.value) return

  const parent = contentBox.value
  const shadowContent = shadowRoot.querySelector('.shadow-content')

  if (!shadowContent) return

  const parentWidth = parent.offsetWidth
  const childWidth = shadowContent.scrollWidth

  if (childWidth === 0) return

  const scale = parentWidth / childWidth

  const hostElement = shadowRoot.host
  hostElement.style.zoom = scale
}

onMounted(async () => {
  shadowRoot = container.value.attachShadow({ mode: 'open' })
  updateContent()
  await nextTick()
  autoScale()
})

watch(() => props.html, async () => {
  updateContent()
  await nextTick()
  autoScale()
})
</script>

<style scoped>
.content-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Inter, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

.content-html {
  width: 100%;
  height: 100%;
}
</style>