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
export default class TropNice extends Vue {
	@Prop({ required: true }) private salut!: string
	@Prop() private bidule?: number
	@Prop() private coucou?: Function
	@Prop({ required: true }) private caca!: Machine
	@Prop() private machin?: number
}
</script>