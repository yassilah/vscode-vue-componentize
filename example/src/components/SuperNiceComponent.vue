<template>
  <div>
    <ergdf
      :bidule="bidule"
      :salut="salut"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class SuperNiceComponent extends Vue {
  @Prop({ required: true }) private salut!: number
import Ergdf from './src/components/Ergdf.vue'
  @Prop() private bidule?: string
  @Prop() private coucou?: Function
  @Prop({ required: true }) private caca!: string
  @Prop({ required: true }) private machin!: number
}
</script>
</script>
