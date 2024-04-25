<script setup lang="ts">
import type { FormInst } from 'naive-ui/es/form';
import { reactive, ref, watchEffect } from 'vue';

import { updateUserPassword } from '@/service';

defineOptions({ name: 'ChangePasswordModal' });

const props = withDefaults(defineProps<Props>(), {
  userId: undefined,
});

type Props = {
  userId: number | undefined;
};

const visible = defineModel<boolean>('visible');

const formRef = ref<HTMLElement & FormInst>();
const title = '修改密码';

const formModel = reactive({
  password: '',
  confirmPassword: '',
});

function closeModal() {
  visible.value = false;
}

function handleSubmit() {
  if (!props.userId)
    return;

  if (formModel.password !== formModel.confirmPassword) {
    window.$message?.error('两次密码不一致');
    return;
  }
  updateUserPassword(props.userId, formModel.password).then(({ error }) => {
    if (error) {
      window.$message?.error(error.msg ?? '修改失败');
      return;
    }
    window.$message?.success('修改成功');
    closeModal();
  });
}

watchEffect(() => {
  if (visible.value) {
    formModel.password = '';
    formModel.confirmPassword = '';
  }
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="title" class="w-600px <lg:w-screen">
    <NForm ref="formRef" label-placement="left" :label-width="80" :model="formModel">
      <NGrid :cols="24" :x-gap="18">
        <NFormItemGridItem :span="24" label="新密码" path="password">
          <NInput v-model:value="formModel.password" type="password" show-password-on="click" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="确认新密码" path="confirmPassword">
          <NInput v-model:value="formModel.confirmPassword" type="password" show-password-on="click" />
        </NFormItemGridItem>
      </NGrid>

      <NSpace class="w-full pt-16px" :size="12" justify="end">
        <NButton class="w-72px" @click="closeModal">
          取消
        </NButton>
        <NButton class="w-72px" type="primary" @click="handleSubmit">
          确定
        </NButton>
      </NSpace>
    </NForm>
  </NModal>
</template>
