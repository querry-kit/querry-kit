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
            Three focused libraries for building typed data products from the API to the interface.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton to="/docs/nest" size="lg" label="Read the docs" trailing-icon="i-lucide-arrow-right" />
          </div>
        </div>
        <UCard class="border-primary/20 bg-default/70 shadow-2xl shadow-primary/10">
          <div class="flex items-center gap-5">
            <img :src="logo" alt="Querry Kit" class="size-24" />
            <div>
              <p class="font-semibold text-highlighted">One consistent data flow</p>
              <p class="mt-1 text-sm leading-6 text-muted">Nest API, headless Nuxt data flow and ready-made Nuxt UI table controls.</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section class="relative overflow-hidden py-18">
      <div class="absolute inset-x-0 top-1/2 -z-10 h-96 -translate-y-1/2 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 blur-3xl" />
      <UContainer>
        <div class="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Libraries</p>
            <h2 class="mt-3 text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">One query flow. Three focused building blocks.</h2>
            <p class="mt-4 max-w-2xl leading-7 text-muted">Use each package independently, or combine them to carry typed data cleanly from a Nest API through Nuxt to the final table controls.</p>
          </div>
          <div class="flex items-center gap-3 rounded-xl border border-default bg-elevated/50 p-4 text-sm leading-6 text-muted">
            <UIcon name="i-lucide-layers-3" class="size-5 shrink-0 text-primary" />
            <span>Small, composable packages without a framework-shaped core.</span>
          </div>
        </div>
        <div class="grid gap-5 lg:grid-cols-3">
          <UCard v-for="item in documentationPackages" :key="item.id" class="group relative flex flex-col overflow-hidden border-default transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-80 transition group-hover:opacity-100" />
            <template #header>
              <div class="flex items-start justify-between gap-4 pt-2">
                <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <UIcon :name="libraryDetails[item.id].icon" class="size-5" />
                </div>
                <UBadge color="neutral" variant="subtle" size="sm">{{ libraryDetails[item.id].layer }}</UBadge>
              </div>
              <h3 class="mt-5 text-lg font-semibold text-highlighted">{{ item.packageName }}</h3>
            </template>
            <p class="text-sm leading-6 text-muted">{{ item.description }}</p>
            <ul class="mt-6 space-y-2 text-sm text-muted">
              <li v-for="highlight in libraryDetails[item.id].highlights" :key="highlight" class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="size-4 shrink-0 text-primary" />
                {{ highlight }}
              </li>
            </ul>
            <template #footer>
              <UButton :to="`/docs/${item.id}`" variant="soft" color="primary" block label="Open documentation" trailing-icon="i-lucide-arrow-right" />
            </template>
          </UCard>
        </div>
      </UContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { documentationPackages, type PackageId } from '~/utils/docs';
import logo from '~/assets/querry-kit-logo.svg';

const libraryDetails: Record<PackageId, { icon: string; layer: string; highlights: string[] }> = {
  nest: {
    icon: 'i-lucide-server-cog',
    layer: 'API layer',
    highlights: ['Resource queries', 'Field projections', 'NestJS API helpers'],
  },
  nuxt: {
    icon: 'i-lucide-panel-top',
    layer: 'Data layer',
    highlights: ['Typed API clients', 'Remote table state', 'Autocomplete composables'],
  },
  'nuxt-ui': {
    icon: 'i-lucide-table-properties',
    layer: 'Interface layer',
    highlights: ['Accessible table controls', 'Composable UI primitives', 'Nuxt UI integration'],
  },
};

useSeoMeta({
  title: 'Querry Kit',
  description: 'Typed building blocks for relational Nest APIs and Nuxt data interfaces.',
});
</script>
