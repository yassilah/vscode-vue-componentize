<template>
  <div>{{ salut + 1 / bidule }}</div>
  <p v-html="coucou"></p>
  <input
    type="text"
    v-model="caca"
  />
  <div v-for="(truc, lol) in machin">
    <p>{{ truc }}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Ergdf extends Vue {
  @Prop({ required: true }) private salut!: number
  @Prop({ required: true }) private bidule!: number
}
</script>
