<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

// import { loginModuleRecord } from "@/constants/app";
// import { useRouterPush } from "@/hooks/common/router";
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import type { LoginData } from '@/service';
import { getCaptchaApi } from '@/service';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({
  name: 'PwdLogin',
});

const authStore = useAuthStore();
// const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { constantRules } = useFormRules();

const model: LoginData = reactive({
  username: 'admin',
  password: '123456',
  captchaCode: '',
  captchaKey: '',
});

const captchaImageBase64 = ref('');

const rules: Record<'username' | 'password', App.Global.FormRule[]> = {
  username: constantRules.username,
  password: constantRules.pwd,
};

async function handleSubmit() {
  await validate();
  await authStore.login(model);
}

async function getCaptcha() {
  const { data } = await getCaptchaApi();

  if (!data || !data.captchaBase64)
    return;

  model.captchaKey = data.captchaKey;
  captchaImageBase64.value = data.captchaBase64;
}

onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false">
    <NFormItem path="username">
      <NInput v-model:value="model.username" :placeholder="$t('page.login.common.usernamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <!-- <NFormItem path="captchaCode">
      <NInput v-model:value="model.captchaCode" :placeholder="$t('page.login.common.codePlaceholder')" />
      <img :src="captchaImageBase64" alt="captcha" style="cursor: pointer" @click="getCaptcha">
    </NFormItem> -->
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary>
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </NButton>
      </div>
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <!--
 <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord["code-login"]) }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </NButton>
      </div>
-->
    </NSpace>
  </NForm>
</template>

<style scoped></style>
