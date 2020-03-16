<template>
  <div>
    <div>{{ salut + 1 / bidule }}</div>
    <p v-html="coucou"></p>
    <input
      type="text"
      v-model="caca"
    />
    <div v-for="(truc, lol) in machin">
      <p>{{ truc }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Rsfg extends Vue {
  @Prop({ required: true }) private salut!: number
  @Prop({ required: true }) private bidule!: number
  @Prop({ required: true }) private coucou!: number
  @Prop({ required: true }) private caca!: number
  @Prop({ required: true }) private machin!: number
}
</script>
