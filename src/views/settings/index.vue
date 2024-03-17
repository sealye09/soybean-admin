<script setup lang="tsx">
import { usePhotoStore } from '@/store';

defineOptions({ name: 'Settings' });

const photoStore = usePhotoStore();
</script>

<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden">
    <NCard :bordered="false" class="h-full shadow">
      <div class="flex flex-col gap-32px">
        <span class="text-18px">证件照生成设置</span>
        <div>
          <span class="px-2px">照片尺寸：</span>
          <NRadioGroup v-model:value="photoStore.size">
            <NRadio value="small" label="1寸" />
            <NRadio value="large" label="2寸" />
          </NRadioGroup>
        </div>

        <div>
          <span class="px-2px">背景颜色：</span>
          <NRadioGroup v-model:value="photoStore.backgroundColor">
            <NRadio value="white" label="白色" />
            <NRadio value="red" label="红色" />
            <NRadio value="blue" label="蓝色" />
          </NRadioGroup>
        </div>

        <div>
          <span class="px-2px">是否上传照片时生成证件照：</span>
          <NSwitch v-model:value="photoStore.canModifyAfterUploadPhoto" />
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
</style>
