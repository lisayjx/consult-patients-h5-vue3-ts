<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IllnessTime } from '@/enums'
import type { ConsultIllness, Image } from '@/types/consult'
import { uploadImage } from '@/api/consult'
import type {
  UploaderAfterRead,
  UploaderFileListItem
} from 'vant/lib/uploader/types'
import { Dialog, showConfirmDialog, showToast } from 'vant'
import { useConsultStore } from '@/stores'
import { useRouter } from 'vue-router'

// // 患病时间
// const timeOptions = [
//   { label: '一周内', value: IllnessTime.Week },
//   { label: '一月内', value: IllnessTime.Month },
//   { label: '半年内', value: IllnessTime.HalfYear },
//   { label: '大于半年', value: IllnessTime.More }
// ]
// // 是否就诊过
// const flagOptions = [
//   { label: '就诊过', value: 0 },
//   { label: '没就诊过', value: 1 }
// ]
import { timeOptions, flagOptions } from '@/api/constants'
// 全部表单信息
const form = ref<ConsultIllness>({
  illnessDesc: '',
  illnessTime: undefined,
  consultFlag: undefined,
  pictures: []
})
// 2.图片上传
// fileList 是配置组件使用的，同步 form 中的 pictures
// 读取成功后，需要自己调用接口上传
// 删除成功后触发的事件，需要去删除 form 中的数据
const fileList = ref<Image[]>([])
const afterRead: UploaderAfterRead = (file) => {
  // file :UploaderFileListItem 选择一张图| UploaderFileListItem[] 选择多个图，我们是一个图
  //如果是数组 就结束，告诉他我们是一张图 是UploaderFileListItem，不告诉就点不出来东西
  if (Array.isArray(file)) return
  // file.file就是你选择的那张图片，如果它不存在就不往下走了,因为file可能不存在
  if (!file.file) return
  // 上传图片
  // file.status控制图片上传状态
  file.status = 'uploading'
  file.message = '上传中...'
  uploadImage(file.file)
    .then((res) => {
      // 上传成功
      file.status = 'done'
      file.message = undefined
      // 展示上传成功的图片,给 file加上 url 是为了删除可以根据 url 进行删除
      file.url = res.data.url
      // 存储到form中，将来要提交
      form.value.pictures?.push(res.data)
    })
    .catch(() => {
      // 上传失败
      file.status = 'failed'
      file.message = '上传失败'
    })
}
const onDeleteImg = (file: UploaderFileListItem) => {
  console.log(form.value.pictures)

  // 删除图片
  //fileList不用管 点击就会自动删除，我们做的就是把提交给后台的form里的删除
  form.value.pictures = form.value.pictures?.filter(
    (item) => item.url !== file.url
  )
}
// 3.点击下一步
// 按钮是否禁用取决于 form里的数据（除了picture图片上传与否都行）是否不完整，所以去看form里的数据类型
// 如果有一个没填就禁用，全都填写完毕才能取消禁用
const disabled = computed(
  () =>
    !form.value.illnessDesc ||
    form.value.illnessTime === undefined ||
    form.value.consultFlag === undefined
)
const store = useConsultStore()
const router = useRouter()
const next = () => {
  if (!form.value.illnessDesc) return showToast('请填写病情描述')
  if (form.value.illnessTime === undefined)
    return showToast('请选择症状持续时间')
  if (form.value.consultFlag === undefined)
    return showToast('请选择是否已经就诊')
  // 存储form到store
  store.setIllness(form.value)
  //   跳转档案管理，需要根据 isChange 实现选择功能
  // 复用家庭档案页面，又要有所区分，所以加了一个isChange
  router.push('/user/patient?isChange=1')
}
// 4.病情描述-回显数据（如果从选择家庭档案页面返回 想重新填写此页面数据 就需要回显）
// 还有从选择科室之后 就会提示问你，是否恢复之前填写的病情信息？
// 如果之前填写过 就会提示，如果之前没填写过就不会提示
// 都是在组件初始化时 做操作
onMounted(() => {
  if (store.consult.illnessDesc) {
    showConfirmDialog({
      title: '温馨提示',
      message: '是否恢复您之前填写的病情信息呢？',
      closeOnPopstate: false
    }).then(() => {
      // 确认
      const { illnessDesc, illnessTime, consultFlag, pictures } = store.consult
      form.value = { illnessDesc, illnessTime, consultFlag, pictures }
      // 图片回显，因为图片显示是看fileList的
      fileList.value = pictures || []
    })
  }
})
// 回显数据后，然后再次修改或者不修改数据 按下一步，然后再次回来回显 发现没有弹窗也没有数据？
// 凡是弹窗都会有这个问题 closeOnPopstate 是否在页面回退时自动关闭 默认是true，我们要改成false
</script>

<template>
  <div class="consult-illness-page">
    <cp-nav-bar title="图文问诊" />
    <!-- 医生提示 -->
    <div class="illness-tip van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <div class="info">
        <p class="tit">在线医生</p>
        <p class="tip">
          请描述你的疾病或症状、是否用药、就诊经历，需要我听过什么样的帮助
        </p>
        <p class="safe">
          <cp-icon name="consult-safe" /><span>内容仅医生可见</span>
        </p>
      </div>
    </div>
    <!-- 收集信息 -->
    <div class="illness-form">
      <van-field
        v-model.trim="form.illnessDesc"
        type="textarea"
        rows="3"
        placeholder="请详细描述您的病情，病情描述不能为空"
      ></van-field>
      <div class="item">
        <p>本次患病多久了？</p>
        <!-- 单选组件 -->
        <cp-radio-btn :options="timeOptions" v-model="form.illnessTime" />
      </div>
      <div class="item">
        <p>此次病情是否去医院就诊过？</p>
        <cp-radio-btn :options="flagOptions" v-model="form.consultFlag" />
      </div>
      <!-- 上传图片 -->
      <div class="illness-img">
        <van-uploader
          :after-read="afterRead"
          v-model="fileList"
          :max-count="9"
          :max-size="5 * 1024 * 1024"
          @delete="onDeleteImg"
          upload-icon="photo-o"
          upload-text="上传图片"
        ></van-uploader>
        <!-- 有图片在就不提示文字了 -->
        <p class="tip" v-if="!fileList.length">
          上传内容仅医生可见,最多9张图,最大5MB
        </p>
      </div>
      <!-- 下一步 -->
      <van-button
        :class="{ disabled: disabled }"
        @click="next"
        type="primary"
        block
        round
        >下一步</van-button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-illness-page {
  padding-top: 46px;
}
.illness-tip {
  display: flex;
  padding: 15px;
  .img {
    width: 52px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }
  .info {
    flex: 1;
    padding-left: 12px;
    .tit {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .tip {
      padding: 12px;
      background: var(--cp-bg);
      color: var(--cp-text3);
      font-size: 13px;
      margin-bottom: 10px;
    }
    .safe {
      font-size: 10px;
      color: var(--cp-text3);
      display: flex;
      align-items: center;
      .cp-icon {
        font-size: 12px;
        margin-right: 2px;
      }
    }
  }
}
.illness-form {
  padding: 15px;
  .van-field {
    padding: 0;
    &::after {
      border-bottom: none;
    }
  }
  .item {
    > p {
      color: var(--cp-text3);
      padding: 15px 0;
    }
  }
}
.illness-img {
  padding-top: 16px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  .tip {
    font-size: 12px;
    color: var(--cp-tip);
  }
  ::v-deep() {
    .van-uploader {
      &__preview {
        /* 删除按钮的样式 */
        &-delete {
          left: -6px;
          top: -6px;
          border-radius: 50%;
          background-color: var(--cp-primary);
          width: 20px;
          height: 20px;
          &-icon {
            transform: scale(0.9) translate(-22%, 22%);
          }
        }
        &-image {
          border-radius: 8px;
          overflow: hidden;
        }
      }
      &__upload {
        border-radius: 8px;
      }
      &__upload-icon {
        color: var(--cp-text3);
      }
    }
  }
}
/* 下一步 */
.van-button {
  font-size: 16px;
  margin-bottom: 30px;
  &.disabled {
    opacity: 1;
    background: #fafafa;
    color: #d9dbde;
    border: #fafafa;
  }
}
</style>
