<template>
  <div>
    <rsfg
      :bidule="bidule"
      :caca="caca"
      :coucou="coucou"
      :machin="machin"
      :salut="salut"
    />
  </div>
</template>

<script lang="ts">
import SuperNiceComponent from './src/components/SuperNiceComponent.vue'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Rsfg from './src/components/Rsfg.vue'

@Component
export default class Coucou extends Vue {}
</script>
