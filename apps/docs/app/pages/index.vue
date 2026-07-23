<template>
  <main>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_15%,--alpha(var(--ui-primary)/20%),transparent_32%),radial-gradient(circle_at_75%_10%,--alpha(var(--ui-color-secondary-500)/16%),transparent_28%)]" />
      <UContainer class="grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
        <div>
          <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Querry Kit</p>
          <h1 class="max-w-3xl text-4xl font-bold tracking-tight text-highlighted sm:text-6xl">
            From relational Nest APIs to useful Nuxt data screens.
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Three focused libraries and one complete, Prisma-backed reference application for typed data products.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton to="/docs/nest" size="lg" label="Read the docs" trailing-icon="i-lucide-arrow-right" />
            <UButton to="#workboard" size="lg" color="neutral" variant="outline" label="Explore Workboard" />
          </div>
        </div>
        <UCard class="border-primary/20 bg-default/70 shadow-2xl shadow-primary/10">
          <div class="flex items-center gap-5">
            <img :src="logo" alt="Querry Kit" class="size-24" />
            <div>
              <p class="font-semibold text-highlighted">One implementation path</p>
              <p class="mt-1 text-sm leading-6 text-muted">Nest API, headless Nuxt data flow and ready-made Nuxt UI table controls.</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section class="py-18">
      <UContainer>
        <div class="mb-8 max-w-2xl">
          <p class="text-sm font-semibold text-primary">Libraries</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">Build every layer with a shared query language.</h2>
        </div>
        <div class="grid gap-5 lg:grid-cols-3">
          <UCard v-for="item in documentationPackages" :key="item.id" class="flex flex-col">
            <template #header><span class="font-semibold text-highlighted">{{ item.packageName }}</span></template>
            <p class="min-h-16 text-sm leading-6 text-muted">{{ item.description }}</p>
            <template #footer>
              <UButton :to="`/docs/${item.id}`" variant="ghost" color="primary" label="Open documentation" trailing-icon="i-lucide-arrow-right" />
            </template>
          </UCard>
        </div>
      </UContainer>
    </section>

    <section id="workboard" class="border-y border-default bg-elevated/40 py-18">
      <UContainer class="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p class="text-sm font-semibold text-primary">Reference application</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">Workboard</h2>
          <p class="mt-4 leading-7 text-muted">A complete product-team workspace that connects the three libraries in one runnable API and web application.</p>
        </div>
        <UCard>
          <div class="flex flex-wrap items-center gap-2 text-sm font-medium text-highlighted">
            <UBadge color="neutral" variant="subtle">Workspace</UBadge><span>→</span><UBadge color="neutral" variant="subtle">Project</UBadge><span>→</span><UBadge color="neutral" variant="subtle">Task</UBadge><span>↔</span><UBadge color="neutral" variant="subtle">Label</UBadge>
          </div>
          <p class="mt-5 text-sm leading-7 text-muted">PostgreSQL and Prisma models, Nest resource queries and a Nuxt table with the Query Kit controls are kept together as a complete reference.</p>
          <pre class="mt-5 overflow-x-auto rounded-lg bg-inverted p-4 text-xs text-inverted"><code>pnpm install
pnpm --filter @querry-kit/example-workboard-api dev
pnpm --filter @querry-kit/example-workboard-web dev</code></pre>
        </UCard>
      </UContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { documentationPackages } from '~/utils/docs';
import logo from '~/assets/querry-kit-logo.svg';

useSeoMeta({
  title: 'Querry Kit',
  description: 'Typed building blocks for relational Nest APIs and Nuxt data interfaces.',
});
</script>
