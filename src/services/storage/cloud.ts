import { appEnv } from '@/config/env'
import { normalizeQuota, type Memorial, type Quota } from '@/types/memorial'
import { COLLECTIONS, type StorageAdapter } from '@/services/storage/types'

type CloudDb = {
  collection: (name: string) => {
    where: (query: Record<string, unknown>) => {
      get: () => Promise<{ data: Array<Record<string, unknown>> }>
      remove: () => Promise<unknown>
    }
    add: (payload: { data: Record<string, unknown> }) => Promise<{ _id: string }>
    doc: (id: string) => {
      update: (payload: { data: Record<string, unknown> }) => Promise<unknown>
      remove: () => Promise<unknown>
    }
  }
}

let inited = false
let cachedOpenid = ''

function getWxCloud(): { init: (opts: { env: string; traceUser?: boolean }) => void; database: () => CloudDb; callFunction: (opts: { name: string }) => Promise<{ result: { openid?: string } }> } {
  // #ifdef MP-WEIXIN
  const cloud = (wx as unknown as { cloud?: ReturnType<typeof getWxCloud> }).cloud
  if (!cloud) {
    throw new Error('当前基础库不支持云开发')
  }
  return cloud
  // #endif
  // #ifndef MP-WEIXIN
  throw new Error('云开发仅在微信小程序可用')
  // #endif
}

function ensureCloud() {
  if (!appEnv.cloudEnabled || !appEnv.cloudEnvId) {
    throw new Error('云开发未启用')
  }
  if (!inited) {
    getWxCloud().init({ env: appEnv.cloudEnvId, traceUser: true })
    inited = true
  }
}

async function getOpenid(): Promise<string> {
  if (cachedOpenid) return cachedOpenid
  ensureCloud()
  const res = await getWxCloud().callFunction({ name: 'login' })
  const openid = res.result?.openid
  if (!openid) {
    throw new Error('未获取到用户标识，请先上传 cloudfunctions/login')
  }
  cachedOpenid = openid
  return openid
}

function db(): CloudDb {
  ensureCloud()
  return getWxCloud().database()
}

function asMemorial(row: Record<string, unknown>): Memorial {
  return {
    id: String(row._id || row.id || ''),
    name: String(row.name || ''),
    calendar: row.calendar === 'lunar' ? 'lunar' : 'solar',
    year: Number(row.year),
    month: Number(row.month),
    day: Number(row.day),
    isLeapMonth: Boolean(row.isLeapMonth),
    yearlyRepeat: Boolean(row.yearlyRepeat),
    note: String(row.note || ''),
    expiresAt: Number(row.expiresAt || 0),
    createdAt: Number(row.createdAt || 0),
    updatedAt: Number(row.updatedAt || 0)
  }
}

export const cloudStore: StorageAdapter = {
  async list() {
    const openid = await getOpenid()
    const res = await db().collection(COLLECTIONS.memory).where({ _openid: openid }).get()
    return res.data.map(asMemorial)
  },

  async save(item: Memorial) {
    const openid = await getOpenid()
    const payload = {
      name: item.name,
      calendar: item.calendar,
      year: item.year,
      month: item.month,
      day: item.day,
      isLeapMonth: Boolean(item.isLeapMonth),
      yearlyRepeat: item.yearlyRepeat,
      note: item.note,
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
    const current = await db().collection(COLLECTIONS.memory).where({ _id: item.id, _openid: openid }).get()
    if (current.data.length > 0) {
      await db().collection(COLLECTIONS.memory).doc(item.id).update({ data: payload })
      return
    }
    await db().collection(COLLECTIONS.memory).add({ data: { ...payload, localId: item.id } })
  },

  async remove(id: string) {
    await getOpenid()
    await db().collection(COLLECTIONS.memory).doc(id).remove()
  },

  async getQuota() {
    const openid = await getOpenid()
    const res = await db().collection(COLLECTIONS.quota).where({ _openid: openid }).get()
    const row = res.data[0]
    return normalizeQuota(row)
  },

  async setQuota(quota: Quota) {
    const openid = await getOpenid()
    const res = await db().collection(COLLECTIONS.quota).where({ _openid: openid }).get()
    if (res.data[0]?._id) {
      await db().collection(COLLECTIONS.quota).doc(String(res.data[0]._id)).update({
        data: { extraSlots: quota.extraSlots, updatedAt: Date.now() }
      })
      return
    }
    await db().collection(COLLECTIONS.quota).add({
      data: { extraSlots: quota.extraSlots, updatedAt: Date.now() }
    })
  },

  async clear() {
    const openid = await getOpenid()
    await db().collection(COLLECTIONS.memory).where({ _openid: openid }).remove()
    await db().collection(COLLECTIONS.quota).where({ _openid: openid }).remove()
  }
}
