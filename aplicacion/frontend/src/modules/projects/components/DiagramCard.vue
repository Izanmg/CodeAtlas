<!--
  DiagramCard.vue

  Tarjeta de diagrama dentro del detalle de proyecto.
-->
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import DiagramThumb from './DiagramThumb.vue'
import { timeAgo } from '../utils/time-format'

const props = defineProps({
  diagram: { type: Object, required: true },
})

const router = useRouter()

const stats = computed(() => ({
  modules: props.diagram.countModules ?? 0,
  screens: props.diagram.countScreens ?? 0,
  tables:  props.diagram.countTables  ?? 0,
  flows:   props.diagram.countFlows   ?? 0,
}))

function open() {
  router.push(`/diagrams/${props.diagram.id}`)
}
</script>

<template>
  <div @click="open">
    <Card hoverable :padding="14">
      <div class="flex flex-col" style="gap: 12px;">
        <DiagramThumb />
        <div>
          <h3
            class="text-fg font-semibold m-0"
            :style="{ fontSize: '14px', letterSpacing: '-0.01em', marginBottom: '3px' }"
          >{{ diagram.name }}</h3>
          <p
            class="text-fg-muted m-0"
            :style="{ fontSize: '12.5px', lineHeight: 1.5 }"
          >{{ diagram.description }}</p>
        </div>
        <div
          class="flex font-mono text-fg-subtle"
          :style="{
            paddingTop: '9px',
            borderTop: '1px solid var(--border-subtle)',
            gap: '12px',
            fontSize: '10.5px',
            letterSpacing: '0.02em',
          }"
        >
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.modules }}</b> mod</span>
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.screens }}</b> scr</span>
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.tables }}</b> db</span>
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.flows }}</b> flow</span>
          <span class="ml-auto">{{ timeAgo(diagram.createdAt) }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>
