<script setup lang="ts">
import { getPatientList, addPatient, editPatient, delPatient } from '@/api/user'
import type { Patient } from '@/types/user'
import { computed, onMounted, ref } from 'vue'
import { nameRules, idCardRules } from '@/utils/rules'
import {
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
  showToast,
  type FormInstance
} from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { useConsultStore } from '@/stores'
// 1. 页面初始化加载数据
const patientList = ref<Patient[]>([])
const loadList = async () => {
  const res = await getPatientList()
  patientList.value = res.data
  // 设置默认选中
  changeDefaultPatient()
}
onMounted(() => {
  loadList()
})

// 3. 打开侧滑栏
const gender = ref(1) //默认选中数据
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]
const showRight = ref(false)
const showPopup = (item?: Patient) => {
  // 为什么要解构初始数据？克隆一份新数据，要不然是同一个对象。
  // 如果有病人信息传进来就是编辑，如果不是就是添加
  if (item) {
    // 如果是编辑 把传进来的数据显示在上
    const { id, gender, name, idCard, defaultFlag } = item
    patient.value = { id, gender, name, idCard, defaultFlag }
  } else {
    // 如果是添加，就把数据先重置
    patient.value = { ...initPatient }
  }
  // 打开
  showRight.value = true
}
// 4.表单数据
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
// 表单数据
const patient = ref<Patient>({ ...initPatient })
// 5.处理默认就诊人:选中是1 不选中是0
// 写一个计算属性 选中true，不选中false传给checkbox组件，
// 因为组件默认传的是布尔值，而后台要0或者1，所以我们要写一个计算属性传给组件，我们的数据0/1不变
//获取值:判断如果defaultFlag是1绑定的值就是true否则是 false
//设置值:如果复选框的值是 true defaultFlag的值就是1否则是0
//  computed(()=>{})  函数写法只能改值
//  computed({ get set})      选项写法 能拿值改值
const defaultFlag = computed({
  get() {
    //get要有返回值 给计算属性defaultFlag，送出去布尔值
    return patient.value.defaultFlag === 1 ? true : false //返回结果 true或false
  },
  set(val) {
    // 当计算属性defaultFlag发生变化需要修改,就可以去修改原本数据patient.defaultFlag 是0/1
    patient.value.defaultFlag = val ? 1 : 0
  }
})
// 5.点击保存表单
const form = ref<FormInstance>()
const submit = async () => {
  // 整体校验
  await form.value?.validate()
  //  校验通过
  // 性别需要和身份证包含性别填写的一致，确认框提示
  // 身份证倒数第二位，单数是男，双数是女
  // slice已有数组中返回选定的元素，返回一个新数组，包含从start到end（不包含该元素）的数组元素。(不会改变原数组)
  const gender = +patient.value.idCard.slice(-2, -1) % 2
  if (gender !== patient.value.gender) {
    return showFailToast('选择的性别与身份证不符')
  }
  // 通过验证
  //  添加 & 修改 有di就是编辑
  patient.value.id
    ? await editPatient(patient.value)
    : await addPatient(patient.value)
  showRight.value = false
  loadList()
  showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')
}

//6. 点击删除患者信息
const deleteBtn = async () => {
  await showConfirmDialog({
    title: '温馨提示',
    message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`
  })
  await delPatient(patient.value.id as string) //因为id设置为可选了 所以这里加as string
  showRight.value = false
  loadList()
  showSuccessToast('删除成功')
}

// 7.由病情描述页面是否传来的isChange来区别 此页面是家庭档案页还是选择患者页
// 1.界面兼容
const route = useRoute()
const isChange = computed(() => {
  return route.query.isChange === '1'
})
// 2.点击效果，选择患者
const patientId = ref<string>() //患者id
const selectPatient = (item: Patient) => {
  if (isChange.value) {
    //如果是选择页面才会做 记录id
    patientId.value = item.id
  }
}
// 3.默认选中，有默认就诊人选他，没有就选第一个
// 在上面1页面上初始化里面
const changeDefaultPatient = () => {
  // 设置默认选中的ID，当你是选择患者的时候，且有患者信息的时候
  if (isChange.value && patientList.value.length) {
    // 从病人列表里找到默认的那项数据
    const defPatient = patientList.value.find((item) => item.defaultFlag === 1)
    // 如果找到了此人 就把此人id赋值给 patientId（默认选中的人的id）
    // 如果没找到默认的人，就把第一个人设置为默认
    if (defPatient) patientId.value = defPatient.id
    else patientId.value = patientList.value[0].id
  }
}
// 4.下一步，一定需要选中患者，存储就诊患者store，记录患者ID跳转支付页面
const store = useConsultStore()
const router = useRouter()
const next = () => {
  if (!patientId.value) return showToast('请选择就诊患者')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'"></cp-nav-bar>
    <div class="patient-list">
      <!-- 头部提示 -->
      <div class="patient-change" v-if="isChange">
        <h3>请选择患者信息</h3>
        <p>以便医生给出更准确的治疗，信息仅医生可见</p>
      </div>
      <div
        class="patient-item"
        @click="selectPatient(item)"
        :class="{ selected: item.id === patientId }"
        v-for="item in patientList"
        :key="item.id"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{
            item.idCard.replace(/^(.{6}).+(.{4})$/, '\$1********\$2')
          }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <!-- 编辑 -->
        <div @click="showPopup(item)" class="icon">
          <cp-icon name="user-edit" />
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <!-- 添加 -->
      <div
        @click="showPopup()"
        class="patient-add"
        v-if="patientList.length < 6"
      >
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 底部按钮 -->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" @click="next" round block>下一步</van-button>
    </div>
    <!-- 侧边栏 -->
    <van-popup v-model:show="showRight" position="right">
      <!-- 头部 -->
      <cp-nav-bar
        :title="`${patient.id ? '编辑' : '添加'}患者`"
        right-text="保存"
        @click-right="submit"
        :back="
          () => {
            showRight = false
          }
        "
      ></cp-nav-bar>
      <!-- 表单 -->
      <van-form ref="form">
        <van-field
          :rules="nameRules"
          v-model="patient.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
        />
        <van-field
          :rules="idCardRules"
          v-model="patient.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
        />
        <van-field label="性别" class="pb4">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn
              v-model="patient.gender"
              :options="options"
            ></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" :icon-size="18" round />
          </template>
        </van-field>
      </van-form>
      <!-- 删除按钮 -->
      <van-action-bar v-if="patient.id">
        <van-action-bar-button @click="deleteBtn">删除</van-action-bar-button>
      </van-action-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
  :deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;
    }
  }
}
.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    //选中效果
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
.pb4 {
  padding-bottom: 4px;
}
/* 删除 */
// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}
</style>
