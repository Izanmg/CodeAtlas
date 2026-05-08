<!--
  FloatingEdge.vue

  Edge "flotante" cuyo origen y destino se calculan en tiempo real como el
  punto donde la línea entre los centros de los dos nodos cruza el
  rectángulo de cada uno. Resultado:
    - La línea siempre toma el camino más directo posible.
    - Cada conexión nace en un punto único de cada cara (no se solapa con
      otras edges que comparten cara), porque el punto depende del ángulo
      exacto al destino.
    - Se recalcula reactivamente al arrastrar un nodo (las posiciones se
      leen de `findNode().computedPosition`).

  Algoritmo basado en el ejemplo "Floating Edges" de React Flow / Vue Flow.
-->
<script setup>
import { computed } from 'vue'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
  useVueFlow,
} from '@vue-flow/core'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id:        { type: String, required: true },
  source:    { type: String, required: true },
  target:    { type: String, required: true },
  style:     { type: Object, default: () => ({}) },
  data:      { type: Object, default: () => ({}) },
  markerEnd: { type: String, default: '' },
  label:     { type: [String, Number], default: '' },
})

const { findNode } = useVueFlow()

const sourceNode = computed(() => findNode(props.source))
const targetNode = computed(() => findNode(props.target))

function getNodeIntersection(intersectionNode, otherNode) {
  const w = (intersectionNode.dimensions?.width  || 240) / 2
  const h = (intersectionNode.dimensions?.height || 140) / 2
  const x2 = intersectionNode.computedPosition.x + w
  const y2 = intersectionNode.computedPosition.y + h
  const x1 = otherNode.computedPosition.x + (otherNode.dimensions?.width  || 240) / 2
  const y1 = otherNode.computedPosition.y + (otherNode.dimensions?.height || 140) / 2

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h)
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h)
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1)
  const xx3 = a * xx1
  const yy3 = a * yy1
  return { x: w * (xx3 + yy3) + x2, y: h * (-xx3 + yy3) + y2 }
}

function getEdgePosition(node, point) {
  const nx = Math.round(node.computedPosition.x)
  const ny = Math.round(node.computedPosition.y)
  const nw = node.dimensions?.width  || 240
  const nh = node.dimensions?.height || 140
  const px = Math.round(point.x)
  const py = Math.round(point.y)

  if (px <= nx + 1)         return Position.Left
  if (px >= nx + nw - 1)    return Position.Right
  if (py <= ny + 1)         return Position.Top
  if (py >= ny + nh - 1)    return Position.Bottom
  return Position.Top
}

const edgeParams = computed(() => {
  const s = sourceNode.value
  const t = targetNode.value
  if (!s || !t || !s.dimensions?.width || !t.dimensions?.width) return null

  const sp = getNodeIntersection(s, t)
  const tp = getNodeIntersection(t, s)
  return {
    sx: sp.x, sy: sp.y,
    tx: tp.x, ty: tp.y,
    sourcePos: getEdgePosition(s, sp),
    targetPos: getEdgePosition(t, tp),
  }
})

const path = computed(() => {
  const p = edgeParams.value
  if (!p) return ['', 0, 0]
  return getSmoothStepPath({
    sourceX: p.sx, sourceY: p.sy, sourcePosition: p.sourcePos,
    targetX: p.tx, targetY: p.ty, targetPosition: p.targetPos,
    borderRadius: 8,
  })
})
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
    :style="style"
    :marker-end="markerEnd"
  />
  <EdgeLabelRenderer v-if="label">
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)`,
        background: 'var(--surface)',
        padding: '1px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        color: 'var(--fg-muted)',
        border: '1px solid var(--border-subtle)',
        pointerEvents: 'all',
      }"
    >
      {{ label }}
    </div>
  </EdgeLabelRenderer>
</template>
