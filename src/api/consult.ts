import type {
  DoctorPage,
  FollowType,
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  TopDep
} from '@/types/consult'
import { request } from '@/utils/request'

// 查询首页 下面知识列表的数据
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('/patient/home/knowledge', 'GET', params)
// 获取推荐关注医生
export const getDoctorPage = (params: PageParams) =>
  request<DoctorPage>('/home/page/doc', 'GET', params)
// 关注/取关， 医生|文章|百科话题|疾病  'doc' | 'knowledge' | 'topic' | 'disease'
export const followOrUnfollow = (id: string, type: FollowType) =>
  request('/like', 'POST', { id, type })
// 获取全部科室
export const getAllDep = () => request<TopDep>('/dep/all', 'get')
