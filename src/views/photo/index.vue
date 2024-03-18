<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { updateStudentPhoto, uploadImageApi } from '@/service';
import type { BackgroundColor, PhotoSize } from '@/store';
import { usePhotoStore } from '@/store';

defineOptions({ name: 'Photo' });

const router = useRouter();

const photoStore = usePhotoStore();

const videoRef = ref<HTMLVideoElement | null>(null);
const photoRef = ref<HTMLImageElement | null>();
const deviceList = ref<MediaDeviceInfo[]>([]);
const showButtons = ref(false);

function toStudentPage() {
  router.push('/student');
}

function listCameras() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log('enumerateDevices() not supported.');
    return;
  }

  // 列出设备
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    deviceList.value = devices.filter(device => device.kind === 'videoinput').map(camera => ({
      ...camera,
      label: camera.label || `camera ${deviceList.value.length + 1}`,
      value: camera.deviceId,
      key: camera.deviceId,
    }));
  }).catch((err) => {
    console.log(`${err.name}: ${err.message}`);
  });
}

function getCameras() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
      listCameras();
    }).catch((err) => {
      console.log(err);
      window.$message?.error('打开摄像头失败');
    });
  }
}

function selectCamera(option: string) {
  if (!videoRef.value || !option) return;

  navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: option,
    },
    audio: false,
  }).then((stream) => {
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.play();
      showButtons.value = true;
    }
  }).catch((err) => {
    console.log(err);
    window.$message?.error('打开摄像头失败');
  });
}

function shoot() {
  if (!videoRef.value || !photoRef.value) return;

  const canvas = document.createElement('canvas');

  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;
  canvas.getContext('2d')?.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
  photoRef.value.src = canvas.toDataURL('image/png');
  photoRef.value.style.width = `${videoRef.value.videoWidth}px`;
  photoRef.value.style.height = `${videoRef.value.videoHeight}px`;
  showButtons.value = true;
}

type PhotoApiBody = {
  image: string;
  size: PhotoSize;
  background_color: BackgroundColor;
};

function generateIdPhoto() {
  if (!photoRef.value || !photoRef.value.src) {
    window.$message?.error('请先拍照');
    return;
  }
  const body: PhotoApiBody = {
    image: photoRef.value.src,
    size: photoStore.size,
    background_color: photoStore.backgroundColor,
  };
  fetch('http://localhost:3030/api/id-photo', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(res => res.json()).then(({ data }) => {
    console.log('🚀 ~ generateIdPhoto ~ data:', data);
    if (!photoRef.value) return;
    photoRef.value.src = data.image;
    photoRef.value.style.width = '295px';
    photoRef.value.style.height = '413px';
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
}

function uploadImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!photoRef.value) return;
      photoRef.value.src = e.target?.result as string;
      photoRef.value.width = 540;
      showButtons.value = true;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function reShoot() {
  if (!videoRef.value || !photoRef.value) return;
  photoRef.value.src = '';
}

function base64ToFile(base64: string) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  const extMatch = base64.split(';')[0].match(/jpeg|png|jpg/);
  const ext = extMatch ? extMatch[0] : 'png';
  for (let i = 0; i < byteString.length; i++)
    ia[i] = byteString.charCodeAt(i);

  const blob = new Blob([ab], { type: `image/${ext}` });

  return new File([blob], `photo.${ext}`, { type: `image/${ext}` });
}

async function handleNext() {
  if (!photoRef.value || !photoRef.value.src) {
    window.$message?.error('请先拍照');
    return false;
  }

  const current = photoStore.waitList[photoStore.currentIdx];
  const photoBase64 = photoRef.value.src;
  const photoBinary = base64ToFile(photoBase64);

  const { error: uploadError, data: uploadData } = await uploadImageApi(photoBinary);
  if (uploadError) {
    window.$message?.error(uploadError.msg);
    return false;
  }
  const { error } = await updateStudentPhoto(+current.id, { photo: uploadData.url });

  if (error) {
    window.$message?.error(error.msg);
    return false;
  }

  photoStore.next();
  if (photoRef.value) photoRef.value.src = '';
  return true;
}

async function handleComplete() {
  const success = await handleNext();
  if (success) {
    window.$message?.success('采集完成');
    photoStore.clearWaitList();
    photoStore.currentIdx = 0;
  }
}
</script>

<template>
  <div class="h-full flex flex-col gap-16px">
    <NCard :bordered="false" class="h-full shadow">
      <div class="flex flex-col gap-12px">
        <div v-if="photoStore.waitList.length === 0" class="text-16px">
          <span>暂无采集任务，</span>
          <NButton text type="primary" @click="toStudentPage">
            <span class="text-16px">
              去添加
            </span>
          </NButton>
        </div>

        <div v-else class="flex flex-col gap-12px">
          <div class="flex gap-128px">
            <div class="flex gap-12px">
              <NDropdown trigger="click" :options="deviceList" @select="selectCamera">
                <NButton type="primary" class="w-fit" @click="getCameras">
                  选择摄像头
                </NButton>
              </NDropdown>
              <NButton type="primary" class="w-fit" @click="uploadImage">
                上传图片
              </NButton>
            </div>

            <div v-if="showButtons" class="flex gap-12px">
              <NButton type="primary" class="w-fit" @click="shoot">
                拍照
              </NButton>

              <NButton
                v-if="photoStore.currentIdx < photoStore.waitList.length - 1"
                type="primary" secondary class="w-fit" @click="handleNext"
              >
                下一个
              </NButton>

              <NButton
                v-else
                type="primary" secondary class="w-fit" @click="handleComplete"
              >
                完成
              </NButton>

              <NButton
                type="primary" secondary class="w-fit"
                @click="generateIdPhoto"
              >
                提交
              </NButton>

              <NButton type="warning" dashed class="w-fit" @click="reShoot">
                重拍
              </NButton>

              <div class="mx-32px flex gap-24px text-primary">
                <span class="text-16px">当前：{{ photoStore.waitList[photoStore.currentIdx].name }}</span>
                <span
                  v-if="photoStore.currentIdx < photoStore.waitList.length - 1"
                  class="text-16px"
                >
                  下一个：{{ photoStore.waitList[photoStore.currentIdx + 1].name }}
                </span>
                <span
                  v-else
                  class="text-16px text-red"
                >
                  已经是最后一个了
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-32px">
            <video ref="videoRef" />
            <img ref="photoRef" class="h-fit w-fit">
          </div>
        </div>
      </div>
    </NCard>
  </div>
</template>
