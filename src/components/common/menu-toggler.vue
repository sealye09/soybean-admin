<script lang="ts" setup>
import { computed } from 'vue';

import { $t } from '@/locales';

defineOptions({ name: 'MenuToggler' });

const props = defineProps<Props>();

interface Props {
  /** Show collapsed icon */
  collapsed?: boolean;
  /** Arrow style icon */
  arrowIcon?: boolean;
}

const arrowIcons = ['line-md:chevron-double-left', 'line-md:chevron-double-right'];
const menuIcons = ['line-md:menu-fold-left', 'line-md:menu-fold-right'];

const closeIcon = computed(() => props.arrowIcon ? arrowIcons[0] : menuIcons[0]);
const openIcon = computed(() => props.arrowIcon ? arrowIcons[1] : menuIcons[1]);
</script>

<template>
  <ButtonIcon
    class="h-full"
    :tooltip-content="collapsed ? $t('icon.expand') : $t('icon.collapse')" tooltip-placement="bottom-start"
  >
    <SvgIcon v-if="collapsed" :icon="openIcon" />
    <SvgIcon v-else :icon="closeIcon" />
  </ButtonIcon>
</template>

<style scoped></style>
