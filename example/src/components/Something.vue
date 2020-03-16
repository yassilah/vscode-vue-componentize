<template>
<div>
			<div>{{salut + 1/bidule}}</div>
			<p v-html="coucou"></p>
			<input type="text" v-model="caca"/>
			<div v-for="(truc, lol) in machin">
				<p>{{truc}}</p>
			</div>
		</div>
</template>


<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Something extends Vue {
	@Prop({ required: true }) private salut: string
	@Prop({ required: true }) private bidule: string
	@Prop({ required: true }) private coucou: number
	@Prop({ required: true }) private caca: Something
	@Prop({ required: true }) private machin: Great[]
}
</script>