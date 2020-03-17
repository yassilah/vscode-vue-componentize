<template>
  <div class="my-component">
    <input
      type="text"
      v-model="foo"
    />
    <div
      :key="index"
      v-for="(bar, index) in bars"
    >
      <span>#{{ index + 1 }} {{ bar }}</span>
      <button @click="myMethod">My method</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop({ required: true }) private foo!: string
  @Prop({ required: true }) private bars!: SomeCustomType[]
}
</script>
