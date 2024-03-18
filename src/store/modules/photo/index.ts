import { defineStore } from 'pinia';
import { ref } from 'vue';

import { SetupStoreId } from '@/enum';

export type PhotoSize = 'small' | 'large';
export type BackgroundColor = 'white' | 'red' | 'blue';

export type WaitItem = { name: string;id: number | string };
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

    const currentIdx = ref<number>(0);

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
    const waitList = ref<WaitItem[]>([]);

    /**
     * 添加待拍照的人员
     * @param item
     */
    function addWaitList(item: WaitItem) {
      waitList.value.push(item);

      return waitList.value;
    }

    function addWaitListList(items: WaitItem[]) {
      waitList.value.push(...items);

      return waitList.value;
    }

    /**
     * 移除待拍照的人员
     * @param item
     */
    function removeWaitList(item: WaitItem) {
      const index = waitList.value.indexOf(item);
      if (index > -1)
        waitList.value.splice(index, 1);

      return waitList.value;
    }

    function clearWaitList() {
      waitList.value = [];
    }

    function next() {
      currentIdx.value++;
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

      currentIdx,
      next,

    };
  },
  {
    persist: true,
  },
);
