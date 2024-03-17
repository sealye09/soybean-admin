import { defineStore } from 'pinia';
import { ref } from 'vue';

import { SetupStoreId } from '@/enum';

export type PhotoSize = 'small' | 'large';
export type BackgroundColor = 'white' | 'red' | 'blue';
export const usePhotoStore = defineStore(
  SetupStoreId.Photo,
  () => {
    /**
     * 照片大小
     */
    const size = ref<PhotoSize>('small');

    /**
     * 背景颜色
     */
    const backgroundColor = ref<BackgroundColor>('blue');

    /**
     * 上传后是否修改照片，生成证件照
     */
    const canModifyAfterUploadPhoto = ref<boolean>(false);

    function setSize(newSize: PhotoSize) {
      size.value = newSize;
    }

    function setBackgroundColor(color: BackgroundColor) {
      backgroundColor.value = color;
    }

    function setCanModifyAfterUploadPhoto(flag: boolean) {
      canModifyAfterUploadPhoto.value = flag;
    }

    /**
     * 待拍照的人员列表 （id）
     */
    const waitList = ref<(string | number)[]>([]);

    /**
     * 添加待拍照的人员
     * @param newId
     */
    function addWaitList(newId: string | number) {
      waitList.value.push(newId);

      return waitList.value;
    }

    function addWaitListList(newIds: (string | number)[]) {
      waitList.value.push(...newIds);

      return waitList.value;
    }

    /**
     * 移除待拍照的人员
     * @param newId
     */
    function removeWaitList(newId: string | number) {
      const index = waitList.value.indexOf(newId);
      if (index > -1)
        waitList.value.splice(index, 1);

      return waitList.value;
    }

    function clearWaitList() {
      waitList.value = [];
    }

    return {
      size,
      backgroundColor,
      canModifyAfterUploadPhoto,
      setSize,
      setBackgroundColor,
      setCanModifyAfterUploadPhoto,

      waitList,
      addWaitList,
      addWaitListList,
      removeWaitList,
      clearWaitList,

    };
  },
  {
    persist: true,
  },
);
