<!--
  ProjectCard.vue

  Tarjeta de proyecto del dashboard. Click → navega al detalle.
-->
<script setup>
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import ProjectThumb from './ProjectThumb.vue'
import EmptyThumb from './EmptyThumb.vue'
import { timeAgo } from '../logica-temporal/time-format'

const props = defineProps({
  project: { type: Object, required: true },
})

const router = useRouter()
function open() {
  router.push(`/projects/${props.project.id}`)
}
</script>

<template>
  <div @click="open">
    <Card hoverable :padding="14">
      <div class="flex flex-col" style="gap: 12px;">
        <ProjectThumb v-if="project.diagramCount > 0" :project="project" />
        <EmptyThumb v-else />
        <div>
          <div class="flex items-center" style="gap: 6px; margin-bottom: 3px;">
            <h3
              class="text-fg font-semibold m-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
              style="font-size: 14px; letter-spacing: -0.01em;"
            >{{ project.name }}</h3>
            <span v-if="project.pinned" class="text-accent flex">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9 9 2 9 7 14 5 22 12 18 19 22 17 14 22 9 15 9z" />
              </svg>
            </span>
          </div>
          <p
            class="text-fg-muted m-0"
            :style="{
              fontSize: '12.5px',
              lineHeight: '1.5',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              minHeight: '36px',
            }"
          >{{ project.description }}</p>
        </div>
        <div
          class="flex justify-between items-center font-mono text-fg-subtle"
          :style="{
            paddingTop: '9px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10.5px',
            letterSpacing: '0.02em',
          }"
        >
          <span>
            {{ project.diagramCount }} {{ project.diagramCount === 1 ? 'diagrama' : 'diagramas' }}
          </span>
          <span>{{ timeAgo(project.updatedAt) }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>
