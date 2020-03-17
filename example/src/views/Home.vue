<template>
  <div class="w-full h-full">
    <my-component
      :bars="bars"
      :foo="foo"
    />
  </div>
</template>

<script lang="ts">
import MyComponent from '../components/MyComponent.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Home extends Vue {
  private foo: string = 'Food'
  private bars: SomeCustomType[] = ['Nice', 'Cool', 'Great']

  public myMethod() {
    console.log('You clicked on my method!')
  }
}
</script>
