import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Whether Supabase is properly configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Only create client if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null

export const BUCKET_NAME = 'catfish'
export const useLocal = !isSupabaseConfigured

// =====================
// Local Storage Helper
// =====================
const LOCAL_PREFIX = 'catfish_'

function localGet(table) {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + table)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function localSave(table, data) {
  localStorage.setItem(LOCAL_PREFIX + table, JSON.stringify(data))
}

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// =====================
// Image Upload (local fallback: base64 data URL)
// =====================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file, module) {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const filePath = `${module}/${timestamp}_${random}.${ext}`

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })

      if (error) throw new Error(`Upload failed: ${error.message}`)

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
      return data.publicUrl
    } catch (storageErr) {
      // Storage 不可用时自动降级为 base64
      console.warn('[catfish] Storage upload failed, falling back to base64:', storageErr.message)
      return fileToBase64(file)
    }
  }

  // Local fallback: convert to base64 data URL
  return fileToBase64(file)
}

// =====================
// Food Records
// =====================
export const foodApi = {
  async getAll() {
    if (useLocal) {
      return localGet('food_records').sort((a, b) =>
        new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at)
      )
    }
    const { data, error } = await supabase
      .from('food_records')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(record) {
    if (useLocal) {
      const list = localGet('food_records')
      const item = { ...record, id: genId(), created_at: new Date().toISOString() }
      list.unshift(item)
      localSave('food_records', list)
      return item
    }
    const { data, error } = await supabase.from('food_records').insert(record).select().single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (useLocal) {
      const list = localGet('food_records').filter(r => r.id !== id)
      localSave('food_records', list)
      return
    }
    const { error } = await supabase.from('food_records').delete().eq('id', id)
    if (error) throw error
  },

  // 补充/更新某条记录的字段（用于「去打分」补打）
  async update(id, fields) {
    if (useLocal) {
      const list = localGet('food_records')
      const idx = list.findIndex(r => r.id === id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...fields }
        localSave('food_records', list)
        return list[idx]
      }
      return null
    }
    const { data, error } = await supabase
      .from('food_records')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getRanking() {
    let data
    if (useLocal) {
      data = localGet('food_records')
    } else {
      const res = await supabase
        .from('food_records')
        .select('restaurant_name, rating, date')
        .order('date', { ascending: false })
      if (res.error) throw res.error
      data = res.data
    }

    const map = new Map()
    for (const item of data) {
      const name = item.restaurant_name
      if (!map.has(name)) {
        map.set(name, { name, ratings: [], count: 0, lastDate: item.date })
      }
      const entry = map.get(name)
      entry.ratings.push(item.rating)
      entry.count++
      if (new Date(item.date) > new Date(entry.lastDate)) {
        entry.lastDate = item.date
      }
    }

    const result = Array.from(map.values()).map(e => ({
      name: e.name,
      avgRating: e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length,
      count: e.count,
      lastDate: e.lastDate
    }))

    return {
      byRating: [...result].sort((a, b) => b.avgRating - a.avgRating),
      byCount: [...result].sort((a, b) => b.count - a.count)
    }
  }
}

// =====================
// Wish Food
// =====================
export const wishFoodApi = {
  async getAll() {
    if (useLocal) {
      return localGet('wish_food')
        .map(item => ({ ...item, status: item.status || 'pending' }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    const { data, error } = await supabase.from('wish_food').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(item => ({ ...item, status: item.status || 'pending' }))
  },

  async create(name) {
    if (useLocal) {
      const list = localGet('wish_food')
      const item = { name, id: genId(), status: 'pending', completed_at: null, created_at: new Date().toISOString() }
      list.unshift(item)
      localSave('wish_food', list)
      return item
    }
    const { data, error } = await supabase.from('wish_food').insert({ name, status: 'pending' }).select().single()
    if (error) throw error
    return data
  },

  async complete(id) {
    const completedAt = new Date().toISOString()
    if (useLocal) {
      const list = localGet('wish_food')
      const item = list.find(r => r.id === id)
      if (item) {
        item.status = 'completed'
        item.completed_at = completedAt
        localSave('wish_food', list)
      }
      return { ...item, status: 'completed', completed_at: completedAt }
    }
    const { data, error } = await supabase
      .from('wish_food')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (useLocal) {
      const list = localGet('wish_food').filter(r => r.id !== id)
      localSave('wish_food', list)
      return
    }
    const { error } = await supabase.from('wish_food').delete().eq('id', id)
    if (error) throw error
  }
}

// =====================
// Movie Records
// =====================
export const movieApi = {
  async getAll() {
    if (useLocal) {
      return localGet('movie_records').sort((a, b) =>
        new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at)
      )
    }
    const { data, error } = await supabase
      .from('movie_records')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(record) {
    if (useLocal) {
      const list = localGet('movie_records')
      const item = { ...record, id: genId(), created_at: new Date().toISOString() }
      list.unshift(item)
      localSave('movie_records', list)
      return item
    }
    const { data, error } = await supabase.from('movie_records').insert(record).select().single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (useLocal) {
      const list = localGet('movie_records').filter(r => r.id !== id)
      localSave('movie_records', list)
      return
    }
    const { error } = await supabase.from('movie_records').delete().eq('id', id)
    if (error) throw error
  },

  async update(id, fields) {
    if (useLocal) {
      const list = localGet('movie_records')
      const idx = list.findIndex(r => r.id === id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...fields }
        localSave('movie_records', list)
        return list[idx]
      }
      return null
    }
    const { data, error } = await supabase
      .from('movie_records')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// =====================
// Travel Records
// =====================
export const travelApi = {
  async getAll() {
    if (useLocal) {
      return localGet('travel_records').sort((a, b) =>
        new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at)
      )
    }
    const { data, error } = await supabase
      .from('travel_records')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(record) {
    if (useLocal) {
      const list = localGet('travel_records')
      const item = { ...record, id: genId(), created_at: new Date().toISOString() }
      list.unshift(item)
      localSave('travel_records', list)
      return item
    }
    const { data, error } = await supabase.from('travel_records').insert(record).select().single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (useLocal) {
      const list = localGet('travel_records').filter(r => r.id !== id)
      localSave('travel_records', list)
      return
    }
    const { error } = await supabase.from('travel_records').delete().eq('id', id)
    if (error) throw error
  }
}

// =====================
// Wish Travel
// =====================
export const wishTravelApi = {
  async getAll() {
    if (useLocal) {
      return localGet('wish_travel')
        .map(item => ({ ...item, status: item.status || 'pending' }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    const { data, error } = await supabase.from('wish_travel').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(item => ({ ...item, status: item.status || 'pending' }))
  },

  async create(location, note) {
    if (useLocal) {
      const list = localGet('wish_travel')
      const item = { location, note, id: genId(), status: 'pending', completed_at: null, created_at: new Date().toISOString() }
      list.unshift(item)
      localSave('wish_travel', list)
      return item
    }
    const { data, error } = await supabase.from('wish_travel').insert({ location, note, status: 'pending' }).select().single()
    if (error) throw error
    return data
  },

  async complete(id) {
    const completedAt = new Date().toISOString()
    if (useLocal) {
      const list = localGet('wish_travel')
      const item = list.find(r => r.id === id)
      if (item) {
        item.status = 'completed'
        item.completed_at = completedAt
        localSave('wish_travel', list)
      }
      return { ...item, status: 'completed', completed_at: completedAt }
    }
    const { data, error } = await supabase
      .from('wish_travel')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (useLocal) {
      const list = localGet('wish_travel').filter(r => r.id !== id)
      localSave('wish_travel', list)
      return
    }
    const { error } = await supabase.from('wish_travel').delete().eq('id', id)
    if (error) throw error
  }
}

// =====================
// Meal Comments (美食留言)
// =====================
export const mealCommentsApi = {
  async getByMealId(mealId) {
    if (useLocal) {
      return localGet('meal_comments')
        .filter(c => c.meal_id === mealId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }
    const { data, error } = await supabase
      .from('meal_comments')
      .select('*')
      .eq('meal_id', mealId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  },

  async create(mealId, author, content) {
    if (useLocal) {
      const list = localGet('meal_comments')
      const item = {
        id: genId(),
        meal_id: mealId,
        author,
        content,
        created_at: new Date().toISOString()
      }
      list.push(item)
      localSave('meal_comments', list)
      return item
    }
    const { data, error } = await supabase
      .from('meal_comments')
      .insert({ meal_id: mealId, author, content })
      .select()
      .single()
    if (error) throw error
    return data
  }
}
